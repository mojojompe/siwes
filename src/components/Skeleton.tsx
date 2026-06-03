export function Skeleton() {
  return (
    <div className="flex-1 p-4 sm:p-8 w-full animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-2" />
      <div className="h-4 bg-slate-200 rounded-lg w-1/2 mb-8" />
      
      <div className="space-y-4">
        <div className="h-32 bg-slate-200 rounded-3xl w-full" />
        <div className="h-32 bg-slate-200 rounded-3xl w-full" />
        <div className="h-32 bg-slate-200 rounded-3xl w-full" />
      </div>
    </div>
  );
}
