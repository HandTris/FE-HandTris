// import { useState } from "react";
// import { motion } from "framer-motion";

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   onCreateRoom: (newRoom: Room) => void;
// };

// const modalVariants = {
//   hidden: { opacity: 0, y: "-50%" },
//   visible: { opacity: 1, y: "0%" },
// };

// function CreateRoomModal({ isOpen, onClose, onCreateRoom }: Props) {
//   const [title, setTitle] = useState("");
//   const [creator, setCreator] = useState("");

//   const handleSubmit = () => {
//     if (title && creator) {
//       const newRoom: Room = {
//         title,
//         creator,
//         playing: false,
//       };
//       onCreateRoom(newRoom);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <motion.div
//         className="bg-gray-800 p-6 rounded-lg w-1/3"
//         initial="hidden"
//         animate="visible"
//         exit="hidden"
//         variants={modalVariants}
//         transition={{ duration: 0.3 }}
//       >
//         <h2 className="text-2xl font-bold text-green-400 mb-4">방 만들기</h2>
//         <label className="block text-green-300 mb-2">방 제목</label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="w-full p-2 mb-4 border rounded bg-gray-900 text-green-400 border-green-600"
//         />
//         <label className="block text-green-300 mb-2">방 생성자</label>
//         <input
//           type="text"
//           value={creator}
//           onChange={(e) => setCreator(e.target.value)}
//           className="w-full p-2 mb-4 border rounded bg-gray-900 text-green-400 border-green-600"
//         />
//         <div className="flex justify-end">
//           <button
//             onClick={handleSubmit}
//             className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 mr-2"
//           >
//             생성
//           </button>
//           <button
//             onClick={onClose}
//             className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
//           >
//             취소
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// export default CreateRoomModal;
