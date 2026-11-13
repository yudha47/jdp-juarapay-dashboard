import { X } from "lucide-react";

type InfoDialogProps = {
    title: string;
    description: string;
    onClose: () => void;
};

function InfoDialog({ title, description, onClose }: InfoDialogProps) {
    return (
        <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-2xl"
            onClick={onClose}
        >
            <div className="w-52 rounded-xl bg-background border border-border p-3 shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-semibold text-foreground">{title}</p>

                    <button onClick={onClose} className="ml-2 p-1 rounded-md hover:bg-muted transition-colors">
                        <X className="h-4 w-4 text-foreground/70" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-xs text-foreground/60 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

export default InfoDialog;
