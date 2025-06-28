import React from 'react';
import { Link, type LinkProps } from 'react-router';
import { useLanguage } from '@/providers/LanguageProvider';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

export const LocalizedLink: React.FC<LocalizedLinkProps> = ({ to, ...props }) => {
  const { getLocalizedPath } = useLanguage();
  const localizedTo = getLocalizedPath(to);

  return <Link to={localizedTo} {...props} />;
};