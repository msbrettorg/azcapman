import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import type {Props} from '@theme/Footer/Layout';
import Link from '@docusaurus/Link';

import styles from './styles.module.css';

export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: Props): ReactNode {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, 'footer', {
        'footer--dark': style === 'dark',
      })}>
      <div className={clsx('container container-fluid', styles.wrapper)}>
        <div className={styles.heroBar}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>Weekend launch scenario</span>
            <h3 className={styles.heroHeading}>
              Ship capacity-ready stamps in 48 hours.
            </h3>
            <p className={styles.heroSubheading}>
              Follow the pragmatic runbook for quota seeding, CRG reservation,
              and asymmetric stamp placement. No more AllocationFailed Mondays.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Link
              className="button button--primary button--lg"
              to="/layer1-permission/operations">
              View Runbook
            </Link>
            <Link
              className={clsx('button button--secondary', styles.secondaryCta)}
              to="/reference/stamps-capacity-planning.html">
              Explore Stamps Architecture
            </Link>
          </div>
        </div>

        {links}
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
