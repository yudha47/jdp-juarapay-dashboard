import { SaldoWithdrawable, fmt } from "../request-settlement-content";

interface Props {
    saldoWithdrawable: SaldoWithdrawable | null;
    onWithdraw: () => void;
}

export function BalanceCard({ saldoWithdrawable, onWithdraw }: Props) {
    return (
        <div className="w-72 shrink-0 space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
                <h2 className="mb-5 text-sm font-semibold text-gray-800 tracking-wide">Balance</h2>

                {saldoWithdrawable ? (
                    <div className="mb-5">
                        <p className="text-xs text-gray-500 mb-1">Withdrawable Balance</p>
                        <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                            {fmt(saldoWithdrawable.availableBalance)}
                        </p>
                        <button
                            onClick={onWithdraw}
                            className="mt-3 w-full rounded-xl bg-emerald-500 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-all shadow-sm"
                        >
                            Withdraw Balance
                        </button>
                    </div>
                ) : (
                    <div className="mb-5">
                        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-5 text-center">
                            <p className="text-xs text-gray-400">No Balance Available</p>
                        </div>
                        <button
                            onClick={onWithdraw}
                            className="mt-3 w-full rounded-xl bg-emerald-500 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-all shadow-sm"
                        >
                            Withdraw
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
