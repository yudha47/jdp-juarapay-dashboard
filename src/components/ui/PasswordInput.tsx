"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({ className, ...rest }: Props) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                type={visible ? "text" : "password"}
                className={`${className ?? ""} pr-10`}
                {...rest}
            />
            <button
                type="button"
                tabIndex={-1}
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
