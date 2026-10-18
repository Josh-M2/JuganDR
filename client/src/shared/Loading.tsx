import React from "react";

type SkeletonProps = {
  className?: string;
  width?: string;
  height?: string;
};

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton ${className}`.trim()}
      style={{ width, height }}
    />
  );
}

export function ButtonSpinner() {
  return <span className="button-spinner" aria-hidden="true" />;
}
