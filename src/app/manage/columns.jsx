"use client";

import './style.css';
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const columns = [
  {
    id: "seeQR",
    // accessorKey: "qrCodeImage",
    // header: "QR Code",
    cell: ({ row }) => {
      // const payment = row.original
      return (
        <div className="w-[20px] qrModalIcon">
          <HoverCard>
            <HoverCardTrigger><Eye className="size-5" strokeWidth={1.5} /></HoverCardTrigger>
            <HoverCardContent className="h-auto w-auto p-[10px]">
                <img src={row.original.qrCodeImage} alt="QR Code" className="w-[150px] h-[150px]" />
            </HoverCardContent>
          </HoverCard>
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-left w-[150px]" >
        QR Code Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[400px] text-left pl-2">{getValue()}</div>
    ),
  },
  {
    accessorKey: "experience",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-[145px]  text-center" >
        QR Experience <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[125px] text-center">{getValue()}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-[160px] text-center"
      >
        Date of Creation
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[145px] text-center ">{getValue()}</div>
    ),
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-[140px] text-center"
      >
        Last Modified
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="w-[130px] text-center">{getValue()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="w-[50px] text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="editOption" onClick={() => navigator.clipboard.writeText(row.original.id)}>
              <Pencil strokeWidth={1.5} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="deleteOption">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];