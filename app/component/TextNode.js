import React from "react";
import { Handle, Position } from "reactflow";

function TextNode({ data, selected }) {
  return (
    <div
      className={`w-40  border-solid border-2 shadow-md rounded-md bg-white   ${
        selected ? "border-indigo-500/100" : "border-black border-opacity-70"
      } `}
    >
      <div className="flex flex-col">
        <div className="px-3 py-2 ">
          <div className="text-xs font-normal text-black">
            {data.label ?? "Text Node"}
          </div>
        </div>
      </div>

      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-slate-500"
      />
      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="w-1 rounded-full bg-gray-500"
      />
    </div>
  );
}

export default TextNode;
