import React from 'react';
import { Link, type LinkProps } from 'react-router';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

export const LocalizedLink: React.FC<LocalizedLinkProps> = ({ to, ...props }) => {
  // No need for localized paths since language is handled via cookies only
  return <Link to={to} {...props} />;
};