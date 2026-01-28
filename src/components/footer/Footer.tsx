import { Link } from "react-router-dom";
import FooterEmailCapture from "./FooterEmailCapture";

const Footer = () => {
  return (
    <footer className="w-full bg-stone-900 text-white pt-16 pb-4 px-6">
      <div className="">
        {/* Email Capture Section */}
        <FooterEmailCapture />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Brand - Left side */}
          <div>
            <h2 className="text-2xl font-light mb-4 tracking-wide">
              LINE OF <span className="text-amber-500">JUDAH</span>
            </h2>
            <p className="text-sm font-light text-white/70 leading-relaxed max-w-md mb-6">
              For those who walk different. If you're not for us, that's okay — this isn't for everyone.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2 text-sm font-light text-white/70">
              <div>
                <p className="font-normal text-white mb-1">Contact Us</p>
                <p>hello@lineofjudah.com</p>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="https://instagram.com/lineofjudahwear" className="text-white/70 hover:text-amber-500 transition-colors">Instagram</a>
                <a href="https://tiktok.com/@lineofjudah" className="text-white/70 hover:text-amber-500 transition-colors">TikTok</a>
                <a href="https://youtube.com/@lineofjudah" className="text-white/70 hover:text-amber-500 transition-colors">YouTube</a>
              </div>
            </div>
          </div>

          {/* Link lists - Right side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h4 className="text-sm font-normal text-white mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link to="/category/tees" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">T-Shirts</Link></li>
                <li><Link to="/category/hoodies" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Hoodies</Link></li>
                <li><Link to="/category/accessories" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Accessories</Link></li>
                <li><Link to="/category/sale" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Sale</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-normal text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">FAQ</Link></li>
                <li><Link to="/shipping" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Shipping</Link></li>
                <li><Link to="/returns" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/about/size-guide" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Size Guide</Link></li>
                <li><Link to="/accessibility" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Accessibility</Link></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-sm font-normal text-white mb-4">About</h4>
              <ul className="space-y-2">
                <li><Link to="/about/our-story" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Our Mission</Link></li>
                <li><Link to="/contact" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Contact Us</Link></li>
                <li><Link to="/ambassador" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Become an Ambassador</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - edge to edge separator */}
      <div className="border-t border-white/10 -mx-6 px-6 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-light text-white/50 mb-2 md:mb-0">
            © 2024 Line of Judah. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm font-light text-white/50 hover:text-amber-500 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm font-light text-white/50 hover:text-amber-500 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;