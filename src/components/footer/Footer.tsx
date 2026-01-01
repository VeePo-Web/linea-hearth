const Footer = () => {
  return (
    <footer className="w-full bg-stone-900 text-white pt-16 pb-4 px-6">
      <div className="">
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
                <li><a href="/category/tees" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">T-Shirts</a></li>
                <li><a href="/category/hoodies" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Hoodies</a></li>
                <li><a href="/category/accessories" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Accessories</a></li>
                <li><a href="/category/sale" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Sale</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-normal text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/faq" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">FAQ</a></li>
                <li><a href="/shipping" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Shipping</a></li>
                <li><a href="/returns" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Returns & Exchanges</a></li>
                <li><a href="/about/size-guide" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Size Guide</a></li>
                <li><a href="/accessibility" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Accessibility</a></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-sm font-normal text-white mb-4">About</h4>
              <ul className="space-y-2">
                <li><a href="/about/our-story" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Our Mission</a></li>
                <li><a href="/about/customer-care" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Customer Care</a></li>
                <li><a href="/ambassador" className="text-sm font-light text-white/70 hover:text-amber-500 transition-colors">Become an Ambassador</a></li>
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
            <a href="/privacy-policy" className="text-sm font-light text-white/50 hover:text-amber-500 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-sm font-light text-white/50 hover:text-amber-500 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;