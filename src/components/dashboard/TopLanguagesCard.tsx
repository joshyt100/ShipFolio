// components/dashboard/TopLanguagesCard.tsx
import React from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Progress } from "@/components/ui/progress";
// import { Palette } from "lucide-react";
// import type { LanguageStat } from "@/app/dashboard/types";

// interface TopLanguagesCardProps {
//   languages: LanguageStat[];
//   isLoading: boolean;
//   username: string;
// }

// export function TopLanguagesCard({ languages, isLoading, username }: TopLanguagesCardProps) {
//   if (isLoading) {
//     return (
//       <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="text-black dark:text-white flex items-center">
//             <Palette className="h-5 w-5 mr-2 text-sky-500" /> Top Languages
//           </CardTitle>
//           <CardDescription className="text-neutral-600 dark:text-neutral-400">
//             Calculating language usage for {username}...
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="space-y-1.5">
//               <div className="flex justify-between text-sm">
//                 <Skeleton className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700" />
//                 <Skeleton className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700" />
//               </div>
//               <Skeleton className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     );
//   }

//   if (languages.length === 0) {
//     return (
//       <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="text-black dark:text-white flex items-center">
//             <Palette className="h-5 w-5 mr-2 text-sky-500" /> Top Languages
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-neutral-500 dark:text-neutral-400">No language data to display for {username}.</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
//       <CardHeader>
//         <CardTitle className="text-black dark:text-white flex items-center">
//           <Palette className="h-5 w-5 mr-2 text-sky-500" /> Top Languages
//         </CardTitle>
//         <CardDescription className="text-neutral-600 dark:text-neutral-400">
//           Language breakdown based on repository data for {username}.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {languages.map((lang) => (
//             <div key={lang.name} className="space-y-1">
//               <div className="flex justify-between text-sm font-medium">
//                 <div className="flex items-center">
//                   {lang.color && (
//                     <span
//                       className="inline-block w-3 h-3 rounded-full mr-2"
//                       style={{ backgroundColor: lang.color }}
//                       aria-label={`${lang.name} color swatch`}
//                     />
//                   )}
//                   <span className="text-neutral-800 dark:text-neutral-200">{lang.name}</span>
//                 </div>
//                 <span className="text-neutral-600 dark:text-neutral-400">{lang.percentage}%</span>
//               </div>
//               <Progress
//                 value={lang.percentage}
//                 className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"
//                 indicatorClassName="rounded-full"
//                 style={{ '--progress-indicator-color': lang.color || '#888888' } as React.CSSProperties}
//               />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// Export a placeholder if needed for imports, or just leave it as is if not imported anywhere when commented out
export function TopLanguagesCard() {
  return null; // Or some placeholder content
}
