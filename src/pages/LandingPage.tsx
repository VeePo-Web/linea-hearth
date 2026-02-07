import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/config/brand";

const NAV_LINKS = [
  { label: "SHOP", href: "/category/shop" },
  { label: "LOOKBOOK", href: "/lookbook" },
  { label: "COMMUNITY", href: "/community" },
  { label: "ABOUT", href: "/about/our-story" },
  { label: "CONTACT", href: "/contact" },
];

// Editorial easing curve (DAZED/032c style)
const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();

  // Full animation variants
  const backgroundVariants = {
    initial: { opacity: 0, scale: 1.03 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: editorialEase },
    },
  };

  const scrimVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.6, delay: 0.2, ease: editorialEase },
    },
  };

  const brandWordVariants = {
    initial: { 
      clipPath: "inset(0 100% 0 0)",
      opacity: 0 
    },
    animate: (i: number) => ({
      clipPath: "inset(0 0% 0 0)",
      opacity: 1,
      transition: { 
        duration: 0.7, 
        delay: 0.5 + i * 0.12, 
        ease: editorialEase 
      },
    }),
  };

  const dividerVariants = {
    initial: { scaleX: 0, opacity: 0 },
    animate: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: 1.0, ease: editorialEase },
    },
  };

  const taglineVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 1.15, ease: editorialEase },
    },
  };

  const navContainerVariants = {
    initial: {},
    animate: {
      transition: { staggerChildren: 0.06, delayChildren: 1.1 },
    },
  };

  const navLinkVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: editorialEase },
    },
  };

  const footerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, delay: 1.5, ease: editorialEase },
    },
  };

  // Simple variants for reduced motion
  const simpleVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  const simpleWordVariants = {
    initial: { opacity: 0 },
    animate: () => ({
      opacity: 1,
      transition: { duration: 0.3 },
    }),
  };

  const v = prefersReducedMotion
    ? {
        background: simpleVariants,
        scrim: simpleVariants,
        brandWord: simpleWordVariants,
        divider: simpleVariants,
        tagline: simpleVariants,
        navContainer: { initial: {}, animate: {} },
        navLink: simpleVariants,
        footer: simpleVariants,
      }
    : {
        background: backgroundVariants,
        scrim: scrimVariants,
        brandWord: brandWordVariants,
        divider: dividerVariants,
        tagline: taglineVariants,
        navContainer: navContainerVariants,
        navLink: navLinkVariants,
        footer: footerVariants,
      };

  return (
    <>
      <Helmet>
        <title>Line of Judah | Premium Faith-Based Streetwear</title>
        <meta
          name="description"
          content="For those who walk different. Premium streetwear that speaks to your faith without saying a word."
        />
      </Helmet>

      <main className="fixed inset-0 h-[100dvh] overflow-hidden bg-black">
        {/* Layer 0: Background Image (with subtle blur) */}
        <motion.div
          className="absolute inset-0"
          variants={v.background}
          initial="initial"
          animate="animate"
        >
          <img
            src="/nav-hero-hoodie.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "blur(1px)" }}
          />
        </motion.div>

        {/* Layer 1: Gradient Scrim (dark bottom/edges) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"
          variants={v.scrim}
          initial="initial"
          animate="animate"
        />

        {/* Layer 2: Warm Color Wash */}
        <div className="absolute inset-0 landing-warm-wash pointer-events-none" />

        {/* Layer 3: Film Grain */}
        <div className="absolute inset-0 hero-noise pointer-events-none" />

        {/* Layer 4: Vignette */}
        <div className="absolute inset-0 landing-vignette pointer-events-none" />

        {/* Content Layer */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Spacer for safe area */}
          <div
            className="shrink-0"
            style={{ height: "max(env(safe-area-inset-top), 24px)" }}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 md:px-12 lg:px-20 xl:px-24">
            {/* Left: Brand Lockup */}
            <div className="flex flex-col justify-center lg:justify-start pt-8 lg:pt-0">
              <h1 className="text-brand-massive text-white uppercase select-none">
                <motion.span
                  className="block"
                  variants={v.brandWord}
                  initial="initial"
                  animate="animate"
                  custom={0}
                >
                  Line
                </motion.span>
                <motion.span
                  className="block"
                  variants={v.brandWord}
                  initial="initial"
                  animate="animate"
                  custom={1}
                >
                  Of
                </motion.span>
                <motion.span
                  className="block text-amber-400"
                  variants={v.brandWord}
                  initial="initial"
                  animate="animate"
                  custom={2}
                >
                  Judah
                </motion.span>
              </h1>

              {/* Divider */}
              <motion.div
                className="w-16 h-px bg-white/40 mt-6 mb-4 origin-left"
                variants={v.divider}
                initial="initial"
                animate="animate"
              />

              {/* Tagline */}
              <motion.p
                className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/60 font-light"
                variants={v.tagline}
                initial="initial"
                animate="animate"
              >
                For those who walk different
              </motion.p>
            </div>

            {/* Right: Navigation */}
            <nav
              className="mt-12 lg:mt-0 lg:text-right"
              role="navigation"
              aria-label="Main navigation"
            >
              <motion.ul
                className="space-y-1"
                variants={v.navContainer}
                initial="initial"
                animate="animate"
              >
                {NAV_LINKS.map((link) => (
                  <motion.li key={link.label} variants={v.navLink}>
                    <Link
                      to={link.href}
                      className="block py-2 text-[11px] md:text-[12px] font-light uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-400"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>
          </div>

          {/* Footer */}
          <motion.footer
            className="flex items-center justify-between px-6 md:px-12 lg:px-20 xl:px-24 shrink-0"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
            }}
            variants={v.footer}
            initial="initial"
            animate="animate"
          >
            {/* Account link */}
            <Link
              to="/account"
              className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-400 py-3"
            >
              {user ? "My Account" : "Sign In"}
            </Link>

            {/* Social link */}
            <a
              href={BRAND.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-400 py-3"
            >
              {BRAND.social.instagram.handle}
            </a>
          </motion.footer>
        </div>
      </main>
    </>
  );
};

export default LandingPage;
