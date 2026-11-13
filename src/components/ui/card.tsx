import React from "react";

type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export const Card = ({ children, className = "" }: CardProps) => (
    <div className={`bg-white rounded-xl ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = "" }: CardProps) => (
    <div className={`px-6 pt-6 pb-2 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }: CardProps) => <h3 className={className}>{children}</h3>;

export const CardContent = ({ children, className = "" }: CardProps) => <div className={className}>{children}</div>;
