import { DinoLogo } from './DinoIcon';
import { Facebook, Heart, Coffee, Code2 } from 'lucide-react';
import carbon from "../assets/carbon-fibre.png";

interface AppInfoProps {
    onClose: () => void;
}

const AppInfo = ({ onClose }: AppInfoProps) => {
    return (
        <div className="w-[320px] bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 flex flex-col">

            {/* BRANDING HEADER */}
            <div className="relative h-32 bg-gradient-to-b from-green-900/40 to-transparent flex items-center justify-center overflow-hidden">
                {/* Hiệu ứng nền */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `url(${carbon})` }}>
                </div>

                {/* DINO LOGO - HERO */}
                <div className="relative z-10 flex flex-col items-center group cursor-default">
                    <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20 shadow-[0_0_30px_rgba(74,222,128,0.3)] group-hover:shadow-[0_0_50px_rgba(74,222,128,0.6)] transition-all duration-500">
                        <DinoLogo size={48} className="text-green-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 text-center -mt-2">
                <h2 className="text-xl font-bold text-white tracking-wide">DinoFocus</h2>
                <p className="text-xs text-zinc-500 font-mono mt-1">v1.0.0 Release</p>

                <div className="my-4 text-sm text-zinc-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    <p>
                        Nơi để tập trung làm việc. Thời gian là của bạn, thế giới… ai rảnh thì lo.
                    </p>
                </div>

                <div className="space-y-3">
                    {/* <div className="flex items-center justify-center gap-4 text-zinc-500">
                        <a href="#" className="hover:text-white transition-colors"><Github size={18} /></a>
                        <a href="#" className="hover:text-blue-400 transition-colors"><Facebook size={18} /></a>
                        <a href="#" className="hover:text-pink-400 transition-colors"><Heart size={18} /></a>
                    </div> */}

                    <button className="w-full flex items-center justify-center gap-2 py-2 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border border-yellow-600/30 rounded-xl text-xs font-bold transition-all">
                        <Coffee size={14} />I need coffee
                    </button>

                    {/* CREDIT SECTION */}
                    <div className="pt-3 border-t border-white/5 mt-2">
                        <div className="flex items-center justify-center gap-1.5 text-[12px] text-zinc-500">
                            <Code2 size={10} />
                            <span>Developed by</span>
                            <span className="text-green-400 font-bold tracking-wide">SlenderIt</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppInfo;