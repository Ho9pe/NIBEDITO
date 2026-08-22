"use client";

import { FEATURES } from "@/constants/dummyData";

export default function Features() {
  return (
    <section className="py-16 lg:py-24 px-[5%] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 relative">
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-600 p-8 lg:p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-12 dark:opacity-15">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-rose-300 to-rose-400 dark:from-rose-500 dark:to-rose-600 rounded-full transform -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-400 to-rose-300 dark:from-rose-600 dark:to-rose-500 rounded-full transform translate-x-20 translate-y-20"></div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-700 to-rose-600 dark:from-gray-100 dark:to-rose-400 bg-clip-text text-transparent">
              Why Choose
            </span>{" "}
            <span className="text-rose-600 dark:text-rose-600 text-4xl lg:text-5xl">
              Us
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-300">
            Experience the difference with our premium service
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="group bg-white/95 dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200/50 dark:border-slate-700 backdrop-blur-sm"
            >
              {/* Feature Content */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rose-700 to-rose-600 rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
