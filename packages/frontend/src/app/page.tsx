"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ScrollParallax } from "react-just-parallax";
import {
  ArrowRight,
  LineChart,
  RefreshCw,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VelocityScroll } from "@/components/ui/text-velocity";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function Home() {
  return (
    <main className="pt-[4rem]">
      {/* Hero Section */}
      <motion.section
        className="h-full min-h-screen flex justify-center items-center relative overflow-hidden dark:bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <FlickeringGrid
          className="absolute z-0 inset-0 size-full"
          color={"#ec4899"}
        />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                  Transform Your Goals into
                  <br className="hidden lg:block" />
                  <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                    Tangible Success
                  </span>
                </h1>
                <p className="text-lg text-zinc-600 dark:text-gray-300 max-w-prose">
                  Goaluxe revolutionizes personal growth through intelligent
                  tracking, actionable insights, and community-powered
                  motivation. Join our exclusive early access program today.
                </p>
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-4">
                <Link href="#waitlist" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Join Waitlist
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                className="relative lg:ml-auto lg:hidden block"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative group w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r w-full from-pink-500 to-orange-500 blur-2xl dark:bg-white opacity-30 group-hover:opacity-40 transition-opacity " />
                  <Card className="relative w-fit rounded-3xl p-6">
                    <Image
                      src="https://kzminnsnzri9g0fv76u2.lite.vusercontent.net/placeholder.svg?height=300&width=500"
                      alt="Goaluxe Dashboard Preview"
                      width={500}
                      height={300}
                      className="rounded-xl shadow-lg"
                      priority
                    />

                    <ScrollParallax isAbsolutelyPositioned>
                      <motion.div
                        className="absolute top-5 -right-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2"
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        <Zap className="h-4 w-4 animate-pulse" />
                        <span>Early Access Available</span>
                      </motion.div>
                    </ScrollParallax>
                  </Card>
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                {[
                  { value: "10k+", label: "Active Users" },
                  { value: "95%", label: "Success Rate" },
                  { value: "4.9/5", label: "Rating" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-zinc-100 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              className="relative lg:ml-auto hidden lg:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative group w-full h-full max-sm:max-w-80">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 blur-2xl dark:bg-white opacity-30 group-hover:opacity-40 transition-opacity" />
                <Card className="relative w-full h-full rounded-3xl p-6">
                  <Image
                    src="https://kzminnsnzri9g0fv76u2.lite.vusercontent.net/placeholder.svg?height=300&width=500"
                    alt="Goaluxe Dashboard Preview"
                    width={500}
                    height={300}
                    className="rounded-xl shadow-lg"
                    priority
                  />

                  <ScrollParallax isAbsolutelyPositioned>
                    <motion.div
                      className="absolute top-5 -right-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2"
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <Zap className="h-4 w-4 animate-pulse" />
                      <span>Early Access Available</span>
                    </motion.div>
                  </ScrollParallax>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="py-20 bg-zinc-50 dark:bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
              How Goaluxe Works
            </h2>
            <p className="text-zinc-600 dark:text-gray-300 mb-8">
              Your journey to success, simplified in four easy steps
            </p>
            <VelocityScroll>
              Set{" "}
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                •
              </span>{" "}
              Track{" "}
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                •
              </span>{" "}
              Achieve{" "}
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                •
              </span>{" "}
              Repeat{" "}
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                •
              </span>
            </VelocityScroll>
          </motion.div>
          <motion.div
            className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200  to-purple-200 dark:from-blue-900/20  dark:via-amber-900/20 dark:to-purple-900/20 transform -translate-y-1/2 z-0" />
            {[
              {
                step: "1",
                title: "Set Your Goals",
                description:
                  "Define clear, actionable goals that align with your aspirations",
                icon: Target,
                color: "bg-blue-100 dark:bg-blue-900/20",
                iconColor: "text-blue-600 dark:text-blue-400",
              },
              {
                step: "2",
                title: "Track Progress",
                description:
                  "Monitor your advancement with our intuitive tracking tools",
                icon: LineChart,
                color: "bg-green-100 dark:bg-green-900/20",
                iconColor: "text-green-600 dark:text-green-400",
              },
              {
                step: "3",
                title: "Stay Motivated",
                description:
                  "Receive personalized insights and encouragement to keep you going",
                icon: Trophy,
                color: "bg-amber-100 dark:bg-amber-900/20",
                iconColor: "text-amber-600 dark:text-amber-400",
              },
              {
                step: "4",
                title: "Achieve Success",
                description:
                  "Celebrate your accomplishments and set new heights to conquer",
                icon: RefreshCw,
                color: "bg-purple-100 dark:bg-purple-900/20",
                iconColor: "text-purple-600 dark:text-purple-400",
              },
            ].map((item, index) => (
              <motion.div key={index} className="relative z-10">
                <Card className="relative h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${item.color} mb-4 relative`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                        {item.step}
                      </div>
                    </motion.div>
                    <h3 className="font-semibold text-xl mb-3 text-zinc-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-900 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div className="relative bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-repeat opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6">
                Start Your Success Journey Today
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of ambitious individuals already transforming
                their lives with Goaluxe
              </p>
              <Link href="#waitlist">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all group"
                >
                  Get Early Access
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="mt-4 text-sm text-gray-400">
                Limited spots available • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// const features = [
//   {
//     icon: Target,
//     title: "AI-Powered Goal Crafting",
//     description:
//       "Smart recommendations based on your aspirations and progress patterns",
//     badge: "New",
//   },
//   {
//     icon: BarChart2,
//     title: "Progress Analytics",
//     description: "Interactive dashboards with real-time progress tracking",
//   },
//   {
//     icon: Clock,
//     title: "Smart Reminders",
//     description: "Context-aware notifications that adapt to your schedule",
//   },
//   {
//     icon: Users,
//     title: "Team Synergy",
//     description: "Collaborative goal-setting with shared milestones",
//   },
//   {
//     icon: Star,
//     title: "Achievement Badges",
//     description: "Earn rewards and showcase your progress",
//   },
//   {
//     icon: Zap,
//     title: "Motivation Engine",
//     description: "Personalized encouragement based on your behavior",
//   },
// ];
