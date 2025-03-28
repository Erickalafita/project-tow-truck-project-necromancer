"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
        <li className={pathname === '/' ? styles.active : ''}>
          <Link href="/">Home</Link>
        </li>
        <li className={pathname === '/auth/login' ? styles.active : ''}>
          <Link href="/auth/login">Login</Link>
        </li>
        <li className={pathname === '/auth/register' ? styles.active : ''}>
          <Link href="/auth/register">Register</Link>
        </li>
        <li className={pathname === '/necromancy/requests' ? styles.active : ''}>
          <Link href="/necromancy/requests">Tow Requests</Link>
        </li>
        <li className={pathname === '/driver/dashboard' ? styles.active : ''}>
          <Link href="/driver/dashboard">Driver Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 