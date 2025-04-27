"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MousePointer,
  LayoutTemplate,
  Users,
  TestTube,
  Edit,
  Copy,
  Image as ImageIcon,
  Type,
  Layout,
  Columns,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <MousePointer className="h-5 w-5" />,
    title: "Drag & Drop Builder",
    description: "Create beautiful emails with our intuitive drag and drop interface.",
  },
  {
    icon: <LayoutTemplate className="h-5 w-5" />,
    title: "1,000+ Templates",
    description: "Access our library of professionally designed email templates.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Nested Segmentation",
    description: "Target the right audience with advanced segmentation options.",
  },
  {
    icon: <TestTube className="h-5 w-5" />,
    title: "A/B User Testing",
    description: "Optimize your emails with data-driven A/B testing.",
  },
];

const templateElements = [
  { icon: <Layout className="h-4 w-4" />, name: "Section" },
  { icon: <Columns className="h-4 w-4" />, name: "Column" },
  { icon: <Type className="h-4 w-4" />, name: "Text" },
  { icon: <ImageIcon className="h-4 w-4" />, name: "Image" },
  { icon: <Button className="h-4 w-4" />, name: "Button" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Canvas element animation variants
const elementVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" },
};

// Demo template data for the builder
const demoTemplate = {
  header: { type: "header", content: "Welcome to our Newsletter" },
  image: {
    type: "image",
    src: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=1974&auto=format&fit=crop",
  },
  text: {
    type: "text",
    content: "This is a sample newsletter created with Letterflow",
  },
  button: { type: "button", content: "Read More" },
};

export default function EmailBuilder() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<number | null>(null);
  const [droppedElements, setDroppedElements] = useState<Array<{ type: string; id: number }>>([]);
  const [nextId, setNextId] = useState(1);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  // Handle dropping of elements
  const handleElementDrop = (elementType: string) => {
    setIsDragging(false);
    setDroppedElements((prev) => [...prev, { type: elementType, id: nextId }]);
    setNextId((prev) => prev + 1);
  };

  // Toggle demo view
  const toggleDemo = () => {
    setShowDemo((prev) => !prev);
    setDroppedElements([]);
  };

  return (
    <section className="relative py-24" id="features">
      <div className="absolute inset-0 bg-gradient-to-b from-[#134e4a] to-[#0d3330] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(16,185,129,0.1),transparent)] -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div className="space-y-8" variants={itemVariants}>
            <div>
              <motion.h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Explore Our Email Builder for Optimal Newsletter Performance
              </motion.h2>
              <motion.p
                className="text-lg text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Create engaging newsletters that convert with our powerful and easy-to-use email
                builder.
              </motion.p>
            </div>

            <motion.div className="space-y-6" variants={containerVariants}>
              {features.map((feature: any, index: any) => (
                <motion.div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-colors duration-300 cursor-pointer ${
                    activeFeature === index ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveFeature(index)}
                >
                  <motion.div
                    className={`flex-shrink-0 rounded-full ${
                      activeFeature === index ? "bg-primary/80" : "bg-primary/20"
                    } p-2 text-white`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-medium text-white">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={toggleDemo} className="bg-primary hover:bg-primary/90 text-white">
                {showDemo ? "Reset Builder" : "Try Interactive Demo"}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div className="relative" variants={itemVariants}>
            <motion.div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/50 to-teal-700/50 blur-lg opacity-70"
              animate={{
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative rounded-xl border border-white/10 bg-[#0f3f3d] overflow-hidden shadow-xl">
              {/* Interactive email builder mockup */}
              <div className="bg-[#0a2c2a] h-10 flex items-center px-3 border-b border-white/10">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-white/50 text-xs mx-auto">Letterflow Email Builder</div>
              </div>

              <div className="grid grid-cols-12 h-[480px]">
                {/* Left sidebar */}
                <div className="col-span-3 border-r border-white/10 p-3 bg-[#0c3532]">
                  <div className="text-white/80 text-xs uppercase tracking-wider mb-3">
                    Elements
                  </div>

                  <div className="space-y-2">
                    {templateElements.map((element: any, idx: any) => (
                      <motion.div
                        key={idx}
                        className="bg-[#0a2c2a] p-2 rounded flex items-center gap-2 text-white/80 text-sm cursor-move"
                        whileHover={{
                          x: 5,
                          backgroundColor: "rgba(16,185,129,0.2)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onHoverStart={() => setHoveredElement(idx)}
                        onHoverEnd={() => setHoveredElement(null)}
                        draggable
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={() => {
                          if (showDemo) {
                            handleElementDrop(element.name.toLowerCase());
                          } else {
                            setIsDragging(false);
                          }
                        }}
                      >
                        {element.icon}
                        {element.name}
                        <motion.div
                          className="ml-auto opacity-0"
                          animate={{ opacity: hoveredElement === idx ? 1 : 0 }}
                        >
                          <Plus className="h-3 w-3 text-primary" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Main canvas */}
                <div
                  className="col-span-9 bg-white p-4 relative overflow-hidden"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (showDemo && hoveredElement !== null) {
                      handleElementDrop(templateElements[hoveredElement].name.toLowerCase());
                    }
                  }}
                >
                  <div className="bg-gray-50 border border-gray-200 rounded h-full flex flex-col">
                    <div className="border-b border-gray-200 p-3 flex justify-center">
                      <div className="px-4 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        Newsletter Title
                      </div>
                    </div>

                    <div className="flex-grow p-6 flex flex-col items-center justify-center overflow-y-auto">
                      {isDragging ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-2 border-dashed border-primary/50 rounded-lg h-full w-full flex items-center justify-center text-primary"
                        >
                          Drop element here
                        </motion.div>
                      ) : showDemo ? (
                        <div className="w-full max-w-md mx-auto space-y-4">
                          <motion.div
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            variants={elementVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <h3 className="text-lg font-medium text-center text-gray-800">
                              {demoTemplate.header.content}
                            </h3>
                          </motion.div>

                          <AnimatePresence>
                            {droppedElements.map((element: any) => (
                              <motion.div
                                key={element.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                                variants={elementVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                whileHover="hover"
                                drag
                                dragConstraints={{
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                }}
                                dragElastic={0.1}
                              >
                                {element.type === "image" && (
                                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                {element.type === "text" && (
                                  <div className="py-2 px-1 border-b border-gray-100">
                                    <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                  </div>
                                )}
                                {element.type === "button" && (
                                  <div className="flex justify-center mt-2">
                                    <div className="px-4 py-2 bg-primary text-white text-xs rounded-md">
                                      Button Text
                                    </div>
                                  </div>
                                )}
                                {element.type === "section" && (
                                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
                                    <div className="text-xs text-gray-500 text-center">
                                      Section Container
                                    </div>
                                  </div>
                                )}
                                {element.type === "column" && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-gray-200 p-2 rounded">
                                      Column 1
                                    </div>
                                    <div className="border border-gray-200 p-2 rounded">
                                      Column 2
                                    </div>
                                  </div>
                                )}

                                <motion.div
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer opacity-0 hover:opacity-100"
                                  onClick={() =>
                                    setDroppedElements((prev) =>
                                      prev.filter((e: any) => e.id !== element.id)
                                    )
                                  }
                                  whileHover={{ scale: 1.2 }}
                                >
                                  ✕
                                </motion.div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <motion.div
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                            variants={elementVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <Image
                              src={demoTemplate.image.src}
                              alt="Newsletter image"
                              width={300}
                              height={200}
                              className="w-full h-auto object-cover"
                            />
                          </motion.div>

                          <motion.div
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            variants={elementVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <p className="text-gray-600 text-center">{demoTemplate.text.content}</p>
                          </motion.div>

                          <motion.div
                            className="flex justify-center"
                            variants={elementVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <button className="px-6 py-2 bg-primary text-white rounded-md">
                              {demoTemplate.button.content}
                            </button>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-6">
                          <Image
                            src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=1974&auto=format&fit=crop"
                            alt="Email template preview"
                            width={300}
                            height={200}
                            className="rounded-lg shadow-lg object-cover"
                          />
                          <motion.div
                            animate={{
                              y: [0, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="mt-4 text-gray-500"
                          >
                            Drag and drop elements to create your newsletter
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Floating toolbar */}
                  <motion.div
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 flex items-center gap-3"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {[
                      { icon: <Edit className="h-4 w-4" />, label: "Edit" },
                      {
                        icon: <Copy className="h-4 w-4" />,
                        label: "Duplicate",
                      },
                      { icon: <Layout className="h-4 w-4" />, label: "Layout" },
                    ].map((tool: any, idx: any) => (
                      <motion.button
                        key={idx}
                        className={`text-gray-600 hover:text-primary flex items-center gap-1 text-xs ${
                          activeTool === tool.label.toLowerCase() ? "text-primary" : ""
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTool(tool.label.toLowerCase())}
                      >
                        {tool.icon}
                        <span>{tool.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Interactive effect when clicking features */}
            <AnimatePresence>
              {activeFeature === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-1/3 right-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 text-xs text-gray-800 flex items-center gap-2"
                >
                  <MousePointer className="h-3 w-3 text-primary" />
                  Drag elements easily
                </motion.div>
              )}

              {activeFeature === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute left-0 bottom-20 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 text-xs text-gray-800"
                >
                  1,000+ templates available
                </motion.div>
              )}

              {activeFeature === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-20 right-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 text-xs text-gray-800"
                >
                  <div className="mb-2 font-medium text-primary flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    Advanced Segmentation
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>Geographic Location</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span>Engagement Level</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span>Subscription Date</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeFeature === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-10 right-20 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-3 text-xs text-gray-800"
                >
                  <div className="mb-2 font-medium text-primary flex items-center gap-1.5">
                    <TestTube className="h-3 w-3" />
                    A/B Testing Dashboard
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-[10px] text-blue-500 font-medium mb-1">Version A</div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <div className="text-[10px] mt-1 text-right">65% open rate</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-[10px] text-green-500 font-medium mb-1">Version B</div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "72%" }}
                        ></div>
                      </div>
                      <div className="text-[10px] mt-1 text-right">72% open rate</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
