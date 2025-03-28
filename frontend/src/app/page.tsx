"use client";

import ClientMap from '@/components/ClientMap';
import Navigation from '@/components/Navigation';
import { SocketProvider } from '@/context/SocketContext';
import styles from './page.module.css';

export default function Home() {
  return (
    <SocketProvider>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Project Necromancer</h1>
          <p>Real-time tow truck tracking service</p>
          <Navigation />
        </header>
        
        <main className={styles.main}>
          <section className={styles.mapSection}>
            <h2>Available Drivers Map</h2>
            <div className={styles.mapContainer}>
              <ClientMap />
            </div>
          </section>
          
          <section className={styles.infoSection}>
            <h2>Service Information</h2>
            <p>Track your tow truck request in real time.</p>
            <p>See available drivers in your area and their estimated arrival time.</p>
            <div className={styles.features}>
              <h3>Main Features:</h3>
              <ul>
                <li>Real-time driver tracking on the map</li>
                <li>Request tow truck services</li>
                <li>Driver dashboard for service providers</li>
                <li>User authentication and account management</li>
              </ul>
            </div>
          </section>
        </main>
        
        <footer className={styles.footer}>
          <p>© 2023 Project Necromancer - All rights reserved</p>
        </footer>
      </div>
    </SocketProvider>
  );
}
