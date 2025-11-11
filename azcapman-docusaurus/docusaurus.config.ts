import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Azure Capacity Management for ISVs',
  tagline: 'Three-layer framework for managing Azure capacity across quota, reservations, and deployment topology',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://aka.ms',
  baseUrl: '/azcapman/',

  organizationName: 'msbrettorg',
  projectName: 'azcapman',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Serve docs at the site's root
          sidebarPath: './sidebars.ts',
          editUrl: undefined, // Remove "Edit this page" links
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/azure-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Azure Capacity Management',
      logo: {
        alt: 'Azure Logo',
        src: 'img/azure-icon.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/msbrettorg/azcapman',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Overview',
              to: '/',
            },
            {
              label: 'Layer 1 - Quota Groups',
              to: '/layer1-permission',
            },
            {
              label: 'Layer 2 - Capacity Reservations',
              to: '/layer2-guarantee',
            },
            {
              label: 'Layer 3 - Deployment Stamps',
              to: '/layer3-topology',
            },
          ],
        },
        {
          title: 'Microsoft Learn',
          items: [
            {
              label: 'Azure Quota Groups',
              href: 'https://learn.microsoft.com/azure/quotas/quota-groups',
            },
            {
              label: 'Capacity Reservations',
              href: 'https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share',
            },
            {
              label: 'Deployment Stamps Pattern',
              href: 'https://learn.microsoft.com/azure/architecture/patterns/deployment-stamp',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Operating Mindset',
              to: '/agents',
            },
            {
              label: 'Reference',
              to: '/reference',
            },
          ],
        },
      ],
      copyright: `Azure Quota and Capacity Management Documentation`,
    },
    prism: {
      theme: prismThemes.vsLight, // Visual Studio Light theme for Microsoft feel
      additionalLanguages: ['bash', 'powershell', 'json', 'yaml'],
    },
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
