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

  // Animation variants
  const backgroundVariants = {
    initial: { opacity: 0, scale: 1.02 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: editorialEase },
    },
  };

  const headerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.15, ease: editorialEase },
    },
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: { staggerChildren: 0.05, delayChildren: 0.25 },
    },
  };

  const linkVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: editorialEase },
    },
  };

  const footerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.4, delay: 0.5, ease: editorialEase },
    },
  };

  // Simple variants for reduced motion
  const simpleVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
  };

  const variants = prefersReducedMotion
    ? {
        background: simpleVariants,
        header: simpleVariants,
        container: { initial: {}, animate: {} },
        link: simpleVariants,
        footer: simpleVariants,
      }
    : {
        background: backgroundVariants,
        header: headerVariants,
        container: containerVariants,
        link: linkVariants,
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

      <motion.main
        className="fixed inset-0 flex flex-col h-[100dvh]"
        style={{
          backgroundImage: `url('/nav-hero-hoodie.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        variants={variants.background}
        initial="initial"
        animate="animate"
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-stone-50/5 pointer-events-none" />

        {/* Header: Logo only */}
        <motion.header
          className="relative z-10 px-6 md:px-8"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 24px)",
          }}
          variants={variants.header}
        >
          <Link
            to="/home"
            className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 rounded"
            aria-label="Go to homepage"
          >
            <img
              src="/logo.svg"
              alt="Line of Judah"
              className="h-5 w-auto filter brightness-0"
            />
          </Link>
        </motion.header>

        {/* Centered navigation links */}
        <nav
          className="flex-1 flex items-center justify-center relative z-10"
          role="navigation"
          aria-label="Main navigation"
        >
          <motion.ul
            className="text-center space-y-0"
            variants={variants.container}
            initial="initial"
            animate="animate"
          >
            {NAV_LINKS.map((link) => (
              <motion.li key={link.label} variants={variants.link}>
                <Link
                  to={link.href}
                  className="block py-3 text-[14px] md:text-[15px] font-light uppercase tracking-[0.25em] leading-[3.5] text-stone-900 hover:text-amber-700 transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-700"
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </nav>

        {/* Footer: Account + Social */}
        <motion.footer
          className="relative z-10 flex items-center justify-between px-6 md:px-8"
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
          }}
          variants={variants.footer}
        >
          {/* Account link */}
          {user ? (
            <Link
              to="/account"
              className="text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-700 py-2"
            >
              My Account
            </Link>
          ) : (
            <Link
              to="/account"
              className="text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-700 py-2"
            >
              Sign In
            </Link>
          )}

          {/* Social link */}
          <a
            href={BRAND.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors duration-300 focus-visible:outline-none focus-visible:text-amber-700 py-2"
          >
            {BRAND.social.instagram.handle}
          </a>
        </motion.footer>
      </motion.main>
    </>
  );
};

export default LandingPage;
