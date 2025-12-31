import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";
import SubmitStoryModal from "./SubmitStoryModal";

export default function SubmitStoryCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-light text-stone-900 mb-2">
                Your Story Matters
              </h2>
              <p className="text-stone-900/70 max-w-lg">
                Every piece of Line of Judah apparel carries a testimony waiting to happen. 
                Share yours and inspire the tribe.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="bg-stone-900 text-white hover:bg-stone-800 rounded-none px-8"
            >
              <Pen className="w-4 h-4 mr-2" />
              Submit Your Story
            </Button>
          </div>
        </div>
      </section>

      <SubmitStoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
