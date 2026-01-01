import { motion } from "framer-motion";

// Placeholder ambassadors - in production, this would come from the database
const ambassadors = [
  { name: "Marcus J.", handle: "@marcusjfaith", avatar: "M" },
  { name: "Sarah K.", handle: "@sarahkbelieve", avatar: "S" },
  { name: "David L.", handle: "@davidlworship", avatar: "D" },
  { name: "Grace M.", handle: "@gracemministry", avatar: "G" },
  { name: "Chris P.", handle: "@chrispwalk", avatar: "C" },
  { name: "Faith N.", handle: "@faithnlight", avatar: "F" },
];

const CurrentAmbassadors = () => {
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24 bg-background border-t border-border">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-eyebrow text-muted-foreground block mb-2">
            Meet the tribe
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{ambassadors.length}+</span> ambassadors
            worldwide
          </p>
        </motion.div>

        {/* Ambassador avatars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {ambassadors.map((ambassador, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="group text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-foreground text-background flex items-center justify-center text-lg md:text-xl font-light mb-2 group-hover:bg-accent transition-colors duration-300">
                {ambassador.avatar}
              </div>
              <p className="text-xs font-light text-muted-foreground group-hover:text-foreground transition-colors">
                {ambassador.handle}
              </p>
            </motion.div>
          ))}

          {/* "You?" placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 * ambassadors.length }}
            className="group text-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center text-lg md:text-xl font-light text-muted-foreground mb-2 group-hover:border-accent group-hover:text-accent transition-colors duration-300">
              ?
            </div>
            <p className="text-xs font-light text-muted-foreground group-hover:text-accent transition-colors">
              You?
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CurrentAmbassadors;
