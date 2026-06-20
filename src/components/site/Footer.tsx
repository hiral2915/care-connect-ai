import { Link } from "@tanstack/react-router";
import { HeartHandshake, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">CareConnect AI</span>
          </div>
          <p className="text-sm text-secondary-foreground/70">
            Modern dental & physiotherapy care, paired with AI-driven NGO support
            so that no one is turned away.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Services</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/dental" className="hover:text-primary">Dental Care</Link></li>
            <li><Link to="/physio" className="hover:text-primary">Physiotherapy</Link></li>
            <li><Link to="/doctors" className="hover:text-primary">Our Doctors</Link></li>
            <li><Link to="/ai-prioritization" className="hover:text-primary">AI Priority Tool</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">NGO Impact</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/ngo" className="hover:text-primary">NGO Support</Link></li>
            <li><Link to="/donate" className="hover:text-primary">Donate</Link></li>
            <li><Link to="/about" className="hover:text-primary">Our Mission</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@careconnect.ai</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Pune, Maharashtra</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-secondary-foreground/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CareConnect AI. All rights reserved.</p>
          <p>Built with care · MCA Final Year Project</p>
        </div>
      </div>
    </footer>
  );
}
