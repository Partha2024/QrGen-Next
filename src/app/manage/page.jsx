"use client";

import React, { useEffect, useState } from "react";
import "./style.css";

import { columns } from "./columns";
import { DataTable } from "./data-table";

import { Icons } from "@/components/icons";

function formatDate(date) {
  if (isNaN(date)) {
    return "Invalid Date";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function Manage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("./api/getQrData");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        const formattedData = result.map((qr) => {
          const createdAtDate = new Date(qr.createdAt);
          const lastModifiedDate = new Date(qr.updatedAt);
          if (isNaN(createdAtDate)) {
            console.error("Invalid createdAt:", qr.createdAt);
          }
          if (isNaN(lastModifiedDate)) {
            console.error("Invalid updatedAt:", qr.updatedAt);
          }
          return {
            id: qr.id,
            qrCodeImage:
              qr.qr_image || "https://www.qrstuff.com/images/sample.png",
            name: qr.qr_code_name,
            experience: qr.qr_experience,
            createdAt: formatDate(createdAtDate), // Format using utility function
            lastModified: formatDate(lastModifiedDate), // Format using utility function
          };
        });
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="managePage">
      <div className="content">
        {loading ? (
          <div className="loadingSpinner">
            <Icons.spinner className="mr-2 h-8 w-8 animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </section>
  );
}

export default Manage;
