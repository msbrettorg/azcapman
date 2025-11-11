import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Layer 1 - Quota Groups',
      collapsed: false,
      items: [
        'layer1-permission/README',
        'layer1-permission/decision',
        'layer1-permission/implementation',
        'layer1-permission/operations',
        'layer1-permission/scenarios',
      ],
    },
    {
      type: 'category',
      label: 'Layer 2 - Capacity Reservations',
      collapsed: false,
      items: [
        'layer2-guarantee/README',
        'layer2-guarantee/decision',
        'layer2-guarantee/implementation',
        'layer2-guarantee/operations',
        'layer2-guarantee/scenarios',
      ],
    },
    {
      type: 'category',
      label: 'Layer 3 - Deployment Stamps',
      collapsed: false,
      items: [
        'layer3-topology/README',
        'layer3-topology/decision',
        'layer3-topology/implementation',
        'layer3-topology/operations',
        'layer3-topology/scenarios',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'reference/README',
        'reference/quota-groups-api',
        'reference/crg-api',
        'reference/crg-sharing-guide',
        'reference/stamps-capacity-planning',
      ],
    },
    {
      type: 'doc',
      id: 'agents',
      label: 'Operating Mindset',
    },
  ],
};

export default sidebars;
