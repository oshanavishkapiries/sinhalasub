import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Github, Twitter, Send } from 'lucide-react';

const footerNav = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = [
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Github, label: 'GitHub' },
    { href: '#', icon: Send, label: 'Telegram' },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/95 py-8">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8" />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
                Your daily dose of movies and tv shows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold">Company</h3>
              <ul className="space-y-2">
                {footerNav.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Connect</h3>
              <ul className="space-y-2">
                {socialLinks.map(item => (
                    <li key={item.label}>
                        <a href={item.href} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </a>
                    </li>
                ))}
              </ul>
            </div>
            <div>
                <h3 className="mb-2 font-semibold">Legal</h3>
                <ul className="space-y-2">
                    <li>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary">DMCA</Link>
                    </li>
                </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} sinhalasub. All rights reserved.</p>
            <p className="mt-1">This site does not store any files on our server, we only index and link to media hosted on 3rd party services.</p>
        </div>
      </div>
    </footer>
  );
}
