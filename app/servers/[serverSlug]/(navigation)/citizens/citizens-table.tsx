"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Citizen } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteCitizen } from "./citizens.action";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { dialogManager } from "@/features/dialog-manager/dialog-manager-store";
import { useQueryState, parseAsInteger } from "nuqs";

type PaginationInfo = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

type CitizensTableProps = {
  citizens: Citizen[];
  serverSlug: string;
  pagination: PaginationInfo;
};

export function CitizensTable({ citizens, serverSlug, pagination }: CitizensTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Parse metadata for each citizen
  const citizensWithMetadata = citizens.map(citizen => ({
    ...citizen,
    metadata: typeof citizen.metadata === 'string' ? JSON.parse(citizen.metadata) : citizen.metadata
  }));

  // Use nuqs for pagination state
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ 
    shallow: false, 
    throttleMs: 1000 
  }));

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      return resolveActionResult(deleteCitizen({ id }));
    },
    onError: (error) => {
      toast.error(error.message);
      setDeletingId(null);
    },
    onSuccess: () => {
      toast.success("Citizen deleted successfully");
      router.refresh();
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string, name: string, lastName: string) => {
    dialogManager.add({
      title: "Delete Citizen",
      description: `Are you sure you want to delete ${name} ${lastName}? This action cannot be undone.`,
      confirmText: "DELETE",
      action: {
        label: "Delete",
        onClick: () => {
          deleteMutation.mutate(id);
        },
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      void setPage(newPage);
    }
  };

  // Generate array of page numbers to display
  const getPageRange = () => {
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [
      1, 
      "ellipsis", 
      currentPage - 1, 
      currentPage, 
      currentPage + 1, 
      "ellipsis", 
      totalPages
    ];
  };

  if (citizens.length === 0) {
    return (
      <div className="text-center my-10">
        <p className="text-muted-foreground">No citizens found. Create your first citizen to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Pilot</TableHead>
              <TableHead>Firearm</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citizensWithMetadata.map((citizen) => (
              <TableRow key={citizen.id}>
                <TableCell>
                  {citizen.image ? (
                    <div className="size-10 rounded-full overflow-hidden">
                      <img 
                        src={citizen.image} 
                        alt={`${citizen.name} ${citizen.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {citizen.name.charAt(0)}{citizen.lastName.charAt(0)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {citizen.name} {citizen.lastName}
                </TableCell>
                <TableCell>{format(new Date(citizen.dateOfBirth), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  {citizen.metadata?.driversLicense ? (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                      {citizen.metadata.driversLicense}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {citizen.metadata?.pilotLicense ? (
                    <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-1 rounded text-xs">
                      {citizen.metadata.pilotLicense}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {citizen.metadata?.firearmsLicense ? (
                    <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs">
                      {citizen.metadata.firearmsLicense}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
                <TableCell>{citizen.phone ?? "-"}</TableCell>
                <TableCell className="w-24">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/servers/${serverSlug}/citizens/${citizen.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={deletingId === citizen.id}
                      onClick={() => handleDelete(citizen.id, citizen.name, citizen.lastName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handlePageChange(page - 1); 
                }} 
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageRange().map((pageNum, i) => (
              pageNum === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href="#" 
                    isActive={pageNum === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum as number);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handlePageChange(page + 1); 
                }}
                aria-disabled={page >= pagination.totalPages}
                className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <div className="text-sm text-muted-foreground text-center">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} citizens
      </div>
    </div>
  );
} 