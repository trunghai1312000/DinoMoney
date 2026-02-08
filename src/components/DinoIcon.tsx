export const DinoIcon = ({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      shapeRendering="crispEdges"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* --- HEAD (ĐẦU) --- */}
      <rect x="27" y="1" width="16" height="2" />
      <rect x="26" y="3" width="18" height="1" />
      
      {/* Mắt và trán */}
      <rect x="26" y="4" width="3" height="1" />
      <rect x="31" y="4" width="13" height="1" />
      
      {/* Hàng mắt (Tạo lỗ hở cho mắt) */}
      <rect x="26" y="5" width="2" height="2" />
      <rect x="31" y="5" width="7" height="1" />
      <rect x="41" y="5" width="3" height="2" />
      <rect x="31" y="6" width="8" height="1" />
      
      {/* Mũi và Miệng cười */}
      <rect x="26" y="7" width="18" height="4" />
      <rect x="28" y="11" width="2" height="2" />
      <rect x="31" y="11" width="7" height="1" />
      <rect x="39" y="11" width="3" height="2" />
      <rect x="32" y="12" width="6" height="1" />
      
      {/* Cằm */}
      <rect x="27" y="13" width="4" height="1" />
      <rect x="33" y="13" width="4" height="1" />
      <rect x="38" y="13" width="4" height="1" />
      <rect x="26" y="14" width="7" height="1" />
      <rect x="37" y="14" width="6" height="1" />
      <rect x="26" y="15" width="17" height="2" />

      {/* --- NECK & ARM (CỔ & TAY) --- */}
      <rect x="29" y="17" width="12" height="1" />
      <rect x="29" y="18" width="11" height="2" />
      
      {/* Ngón tay cái (Thumb Up) - Đã chỉnh dài và rõ hơn */}
      <rect x="43" y="19" width="3" height="2" /> {/* Đầu ngón tay */}
      <rect x="43" y="21" width="3" height="1" /> {/* Gốc ngón tay */}
      
      <rect x="25" y="20" width="15" height="2" />

      {/* --- BODY & TAIL (THÂN & ĐUÔI) --- */}
      {/* Lưng nối xuống đuôi */}
      <rect x="22" y="22" width="24" height="1" />
      <rect x="22" y="23" width="23" height="1" />
      
      {/* Đuôi bắt đầu (nhọn) */}
      <rect x="7" y="24" width="8" height="2" />
      <rect x="20" y="24" width="20" height="2" />
      
      {/* Chóp đuôi dài và nhọn ra sau */}
      <rect x="2" y="26" width="38" height="2" />
      
      {/* Phần bụng cong mềm mại (Stepped curve) */}
      <rect x="9" y="28" width="31" height="2" />
      <rect x="11" y="30" width="29" height="1" />
      <rect x="11" y="31" width="28" height="1" />
      <rect x="11" y="32" width="27" height="1" />
      <rect x="13" y="33" width="25" height="1" />
      <rect x="14" y="34" width="24" height="1" />
      <rect x="16" y="35" width="20" height="2" />
      
      {/* Hông đùi */}
      <rect x="18" y="37" width="16" height="2" />

      {/* --- LEGS (CHÂN) --- */}
      {/* Chân trái */}
      <rect x="20" y="39" width="7" height="2" />
      <rect x="20" y="41" width="5" height="2" />
      <rect x="20" y="43" width="3" height="1" />
      <rect x="20" y="44" width="2" height="2" />
      <rect x="20" y="46" width="5" height="2" /> {/* Bàn chân trái */}

      {/* Chân phải */}
      <rect x="29" y="39" width="5" height="2" />
      <rect x="31" y="41" width="3" height="1" />
      <rect x="32" y="42" width="2" height="4" />
      <rect x="32" y="46" width="4" height="2" /> {/* Bàn chân phải */}
    </svg>
  );
};