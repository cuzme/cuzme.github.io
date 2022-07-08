import React from 'react';
// import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';
import {useColorMode} from '@docusaurus/theme-common';

import styles from './index.module.css';

// function HomepageHeader() {
//   const {siteConfig} = useDocusaurusContext();
//
//   return (
//     <header className={clsx('hero hero--primary', styles.heroBanner)}>
//       <div className="container">
//         <h1 className="hero__title">{siteConfig.title}</h1>
//         <p className="hero__subtitle">{siteConfig.tagline}</p>
//         <div className={styles.buttons}>
//           <Link
//             className="button button--secondary button--lg"
//             to="/docs/intro">
//             Docusaurus Tutorial - 5min ⏱️
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }


function Background() {
  const {colorMode} = useColorMode();
  return (
      <div className={styles.background} style={{backgroundImage: `url(/img/cool-background-${colorMode}.png)`}}/>
  )
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Yobi's website"
    >
      {/*<HomepageHeader />*/}
      {/*<main>*/}
      {/*  <HomepageFeatures />*/}
      {/*</main>*/}
      <Background />
    </Layout>
  );
}
