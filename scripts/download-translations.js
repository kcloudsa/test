#!/usr/bin/env node

import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import prettier from 'prettier';
import { config } from 'dotenv';

config();

// Configuration
const API_KEY = process.env.I18NEXUS_API_KEY || 'your_api_key_here';
const LANGUAGES = (process.env.I18N_LANGUAGES || 'en-US,ar-SA').split(',');
const OUTPUT_DIR = process.env.I18N_OUTPUT_DIR || 'src/i18n/messages';
const BASE_URL = 'https://api.i18nexus.com/project_resources/translations';

console.log('🚀 Starting translation download...');
console.log(`📂 Output directory: ${OUTPUT_DIR}`);

// Ensure output directory exists
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

// Merge existing translations with new ones
function mergeTranslations(existing, newTranslations) {
    const merged = { ...existing };
    
    for (const [key, value] of Object.entries(newTranslations)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            merged[key] = mergeTranslations(merged[key] || {}, value);
        } else {
            merged[key] = value; // Update existing or add new
        }
    }
    
    return merged;
}

// Load existing translation file
async function loadExistingTranslations(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // File doesn't exist, return empty object
        }
        console.warn(`⚠️  Could not parse existing file ${filePath}: ${error.message}`);
        return {};
    }
}

// Save translation file with prettier formatting
async function saveTranslationFile(filePath, data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const formatted = await prettier.format(jsonString, {
            parser: 'json',
            tabWidth: 2,
            useTabs: false,
            semi: false,
            singleQuote: false,
            trailingComma: 'none'
        });
        
        await fs.writeFile(filePath, formatted, 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Failed to save file ${filePath}: ${error.message}`);
        return false;
    }
}

// Get file stats
async function getFileStats(filePath) {
    try {
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        const keyCount = Object.keys(data).length;
        return {
            size: stats.size,
            keys: keyCount
        };
    } catch (error) {
        return {
            size: 'unknown',
            keys: '?'
        };
    }
}

// Count nested keys recursively
function countAllKeys(obj) {
    let count = 0;
    for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            count += countAllKeys(value);
        } else {
            count++;
        }
    }
    return count;
}

async function downloadTranslations() {
    try {
        console.log('🔍 Fetching all translations from API...');
        
        // Fetch all translations from API
        const response = await axios.get(`${BASE_URL}?api_key=${API_KEY}`);
        
        if (!response.data) {
            throw new Error('No data received from API');
        }
        
        console.log('✅ Successfully fetched translations from API');
        
        const fullResponse = response.data;
        
        // Ensure output directory exists
        await ensureDir(OUTPUT_DIR);
        
        // Process each configured language
        for (const lang of LANGUAGES) {
            console.log(`\n🌐 Processing language: ${lang}`);
            
            if (!fullResponse[lang]) {
                console.log(`⚠️  Language ${lang} not found in API response - skipping`);
                continue;
            }
            
            // Create language directory
            const langDir = path.join(OUTPUT_DIR, lang);
            await ensureDir(langDir);
            
            // Get all namespaces for this language
            const namespaces = Object.keys(fullResponse[lang]);
            
            if (namespaces.length === 0) {
                console.log(`⚠️  No namespaces found for ${lang} - skipping`);
                continue;
            }
            
            console.log(`📦 Found ${namespaces.length} namespace(s) for ${lang}: ${namespaces.join(', ')}`);
            
            // Process each namespace
            for (let i = 0; i < namespaces.length; i++) {
                const ns = namespaces[i];
                const counter = i + 1;
                
                console.log(`📥 [${counter}/${namespaces.length}] Processing ${lang}/${ns}.json...`);
                
                const filePath = path.join(langDir, `${ns}.json`);
                const newTranslations = fullResponse[lang][ns];
                
                try {
                    // Load existing translations
                    const existingTranslations = await loadExistingTranslations(filePath);
                    
                    // Merge translations (new keys added, existing keys updated)
                    const mergedTranslations = mergeTranslations(existingTranslations, newTranslations);
                    
                    // Save merged translations
                    const saveSuccess = await saveTranslationFile(filePath, mergedTranslations);
                    
                    if (saveSuccess) {
                        const existingKeyCount = countAllKeys(existingTranslations);
                        const newKeyCount = countAllKeys(newTranslations);
                        const totalKeyCount = countAllKeys(mergedTranslations);
                        
                        if (existingKeyCount === 0) {
                            console.log(`✅ Created new file: ${lang}/${ns}.json (${totalKeyCount} keys)`);
                        } else {
                            const addedKeys = totalKeyCount - existingKeyCount;
                            console.log(`✅ Updated file: ${lang}/${ns}.json (${existingKeyCount} → ${totalKeyCount} keys, +${addedKeys} new)`);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Failed to process ${lang}/${ns}.json: ${error.message}`);
                }
            }
        }
        
        console.log('\n🎉 Translation download completed!');
        console.log(`📁 Files saved to: ${OUTPUT_DIR}`);
        
        // List all downloaded files with details
        console.log('\n📋 Downloaded translation files:');
        
        const allFiles = [];
        for (const lang of LANGUAGES) {
            const langDir = path.join(OUTPUT_DIR, lang);
            try {
                const files = await fs.readdir(langDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        allFiles.push(path.join(langDir, file));
                    }
                }
            } catch (error) {
                // Directory doesn't exist, skip
            }
        }
        
        allFiles.sort();
        
        for (const file of allFiles) {
            const stats = await getFileStats(file);
            console.log(`   📄 ${file} (${stats.size} bytes, ${stats.keys} keys)`);
        }
        
        console.log(`\n📊 Summary: ${allFiles.length} translation files processed`);
        
        // Show available namespaces
        console.log('\n🗂️  Available namespaces in API:');
        for (const [lang, langData] of Object.entries(fullResponse)) {
            const namespaces = Object.keys(langData);
            for (const ns of namespaces) {
                console.log(`   ${lang}: ${ns}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error downloading translations:', error.message);
        process.exit(1);
    }
}

// Run the download
downloadTranslations();