"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  Layers,
  Move,
  Settings,
  Trash2,
  Save,
  Download,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  hover: { scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" },
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

  // Auto-rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle dropping of elements
  const handleElementDrop = (elementType: string) => {
    setIsDragging(false);
    setDroppedElements((prev) => [...prev, { type: elementType, id: nextId }]);
    setNextId((prev) => prev + 1);
  };

  // Toggle demo view
  const toggleDemo = () => {
    setShowDemo((prev) => !prev);
    if (!showDemo) {
      // Add some default elements when entering demo mode
      setDroppedElements([
        { type: "text", id: 1 },
        { type: "image", id: 2 },
      ]);
      setNextId(3);
    } else {
      setDroppedElements([]);
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-900 to-slate-950" id="features">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(16,185,129,0.1),transparent)] -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
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
                className="text-lg text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Create engaging newsletters that convert with our powerful and easy-to-use email
                builder.
              </motion.p>
            </div>

            <motion.div className="space-y-4" variants={containerVariants}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-colors duration-300 cursor-pointer border ${
                    activeFeature === index
                      ? "bg-slate-800/80 border-emerald-500/20"
                      : "border-slate-800 hover:bg-slate-800/50"
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, borderColor: "rgba(16,185,129,0.3)" }}
                  onClick={() => setActiveFeature(index)}
                >
                  <motion.div
                    className={`flex-shrink-0 rounded-full ${
                      activeFeature === index ? "bg-emerald-500/30" : "bg-slate-800"
                    } p-2.5 text-emerald-400`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-medium text-white">{feature.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{feature.description}</p>
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
              <Button
                onClick={toggleDemo}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                {showDemo ? (
                  <>
                    <Layers className="h-4 w-4" />
                    <span>Reset Builder</span>
                  </>
                ) : (
                  <>
                    <Move className="h-4 w-4" />
                    <span>Try Interactive Demo</span>
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div className="relative" variants={itemVariants}>
            <motion.div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-700/30 blur-lg opacity-70"
              animate={{
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
              {/* Email builder header */}
              <div className="bg-slate-800 flex items-center px-3 py-2 justify-between border-b border-slate-700/50">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-slate-300 text-sm font-medium">Letterflow Email Builder</div>
                <div className="w-10"></div> {/* Spacer to center the title */}
              </div>

              <div className="grid grid-cols-12 h-[480px]">
                {/* Left sidebar */}
                <div className="col-span-3 border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
                  <div className="p-3 border-b border-slate-700/50">
                    <div className="text-slate-300 text-xs uppercase tracking-wider font-medium mb-3">
                      ELEMENTS
                    </div>

                    <div className="space-y-2">
                      {templateElements.map((element, idx) => (
                        <motion.div
                          key={idx}
                          className="bg-slate-800/80 p-2 rounded-md flex items-center gap-2 text-slate-300 text-sm cursor-move border border-slate-700/50 group"
                          whileHover={{
                            x: 3,
                            backgroundColor: "rgba(16,185,129,0.15)",
                            borderColor: "rgba(16,185,129,0.3)",
                          }}
                          whileTap={{ scale: 0.97 }}
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
                          <div className="text-emerald-400">{element.icon}</div>
                          {element.name}
                          <motion.div
                            className="ml-auto text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            animate={{ x: hoveredElement === idx ? 0 : -5 }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="text-slate-300 text-xs uppercase tracking-wider font-medium mb-3">
                      SETTINGS
                    </div>

                    {["Layout", "Style", "Content", "Preview"].map((setting, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center justify-between p-2 text-slate-400 text-sm hover:text-white transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        <span>{setting}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Main canvas */}
                <div
                  className="col-span-9 bg-white p-3 relative overflow-hidden"
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
                  <div className="bg-gray-50 border border-gray-200 rounded-md h-full flex flex-col">
                    <div className="border-b border-gray-200 py-2 px-4 flex justify-center">
                      <div className="px-4 py-1 bg-slate-200 text-slate-700 text-sm rounded-full font-medium">
                        Newsletter Title
                      </div>
                    </div>

                    <div className="flex-grow p-6 flex flex-col items-center justify-center overflow-y-auto">
                      {isDragging ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-2 border-dashed border-emerald-500/40 rounded-lg h-full w-full flex items-center justify-center text-emerald-600"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Plus className="h-8 w-8 opacity-50" />
                            <span className="text-sm">Drop element here</span>
                          </div>
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
                              Welcome to our Newsletter
                            </h3>
                          </motion.div>

                          <AnimatePresence>
                            {droppedElements.map((element) => (
                              <motion.div
                                key={element.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative group"
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
                                  <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                                    <Image
                                      src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1000&auto=format&fit=crop"
                                      alt="Draggable image content"
                                      width={400}
                                      height={225}
                                      className="w-full h-auto object-cover rounded-md"
                                    />
                                  </div>
                                )}
                                {element.type === "text" && (
                                  <div className="py-2 px-1 text-gray-700">
                                    <p>
                                      This is a sample newsletter created with our amazing
                                      drag-and-drop builder. You can easily edit this text to add
                                      your own content.
                                    </p>
                                  </div>
                                )}
                                {element.type === "button" && (
                                  <div className="flex justify-center mt-2">
                                    <div className="px-5 py-2 bg-emerald-600 text-white text-sm rounded-md font-medium">
                                      Read More
                                    </div>
                                  </div>
                                )}
                                {element.type === "section" && (
                                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
                                    <div className="text-xs text-gray-500 text-center">
                                      Section Container (Drag content here)
                                    </div>
                                  </div>
                                )}
                                {element.type === "column" && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-gray-200 p-3 rounded-md bg-gray-50 text-xs text-gray-500 text-center">
                                      Column 1
                                    </div>
                                    <div className="border border-gray-200 p-3 rounded-md bg-gray-50 text-xs text-gray-500 text-center">
                                      Column 2
                                    </div>
                                  </div>
                                )}

                                {/* Element controls */}
                                <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <motion.button
                                    className="bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                                    whileHover={{ scale: 1.1, backgroundColor: "#1e293b" }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </motion.button>
                                  <motion.button
                                    className="bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                                    whileHover={{ scale: 1.1, backgroundColor: "#1e293b" }}
                                  >
                                    <Move className="h-3 w-3" />
                                  </motion.button>
                                  <motion.button
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                                    whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                                    onClick={() =>
                                      setDroppedElements((prev) =>
                                        prev.filter((e) => e.id !== element.id)
                                      )
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <motion.div
                            className="flex justify-center mt-8"
                            variants={elementVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                              Subscribe Now
                            </button>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-6">
                          <Image
                            src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1000&auto=format&fit=crop"
                            alt="Email newsletter template"
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
                            Drag elements from the sidebar to create your newsletter
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Canvas bottom toolbar */}
                    <div className="border-t border-gray-200 p-2 flex justify-between items-center">
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Desktop View</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Edit</span>
                        <span>Duplicate</span>
                        <span>Layout</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating action buttons */}
                  <motion.div
                    className="absolute bottom-6 right-6 flex gap-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      className="bg-slate-800 hover:bg-slate-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Settings className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Interactive feature tooltips */}
            <AnimatePresence>
              {activeFeature === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-1/3 right-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 text-xs text-gray-800 flex items-center gap-2 border border-emerald-100"
                >
                  <MousePointer className="h-3 w-3 text-emerald-500" />
                  Drag elements easily
                </motion.div>
              )}

              {activeFeature === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute left-0 bottom-20 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 text-xs text-gray-800 border border-emerald-100"
                >
                  1,000+ templates available
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
