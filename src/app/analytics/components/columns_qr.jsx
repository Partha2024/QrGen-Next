'use client';

import './style.css';
import { ArrowUpDown} from "lucide-react";

import { Button } from "@/components/ui/button";

export const columns = (onDelete, onEdit) => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-left w-[150px]"
      >
        QR Code Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[600px] text-left pl-2">{getValue()}</div>
    ),
  },
  {
    accessorKey: "experience",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-[145px] text-center"
      >
        Total Scans <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[145px] text-center uppercase">{getValue()}</div>
    ),
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-[180px] text-center"
      >
        Total Unique Users
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[180px] text-center">{getValue()}</div>
    ),
  },
];