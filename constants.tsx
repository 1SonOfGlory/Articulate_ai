import React from 'react';
import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'startup-pitch',
    title: 'Seed Funding Pitch',
    description: 'Present your early-stage venture to a seasoned Venture Capitalist.',
    counterpart: 'Skeptical Investor',
    role: 'Startup Founder'
  },
  {
    id: 'salary-negotiation',
    title: 'Salary Negotiation',
    description: 'Advocate for your value during an annual performance review.',
    counterpart: 'Senior Director',
    role: 'Employee'
  },
  {
    id: 'networking-event',
    title: 'High-Stakes Networking',
    description: 'Make a lasting impression on an industry leader at a gala.',
    counterpart: 'Industry Titan',
    role: 'Professional'
  },
  {
    id: 'crisis-management',
    title: 'Crisis Management',
    description: 'Address a product failure with a concerned stakeholder.',
    counterpart: 'Aggrieved Client',
    role: 'Communications Lead'
  }
];

export const Icons = {
  Play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </svg>
  ),
  Volume: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="9" width="4" height="6" rx="1" />
      <path d="M10 5L6 9v6l4 4V5z" />
      <path d="M14 8a4 4 0 0 1 0 8" />
    </svg>
  ),
  Circle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
  Square: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  Triangle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 5l7 12H5z" />
    </svg>
  )
};