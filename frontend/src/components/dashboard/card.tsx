import { useState } from "react";
import { deleteLink } from "../actions";
import {
  Copy,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  Eye,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Dialog from "./dialog";
import Link from "next/link";
import { links } from "@/types";

const LinkCard = ({ id, original, shortenUrl, clicks, createdAt }: links) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const truncateUrl = (url: string, maxLength = 50) => {
    if (typeof url !== "string") return "";
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  return (
    <Card className="group bg-white/80 backdrop-blur-sm rounded-xl h-fit p-1 shadow-md border border-white/40 transition-all duration-300">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{clicks} clicks</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={async () => {
                    await navigator.clipboard.writeText(shortenUrl);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await navigator.clipboard.writeText(original);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Original
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors duration-200"
                  onClick={() => {
                    setIsDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            action={async () => {
              await deleteLink(id);
            }}
          />
          <div className="space-y-2">
            <div>
              <p className="font-medium text-primary text-sm">
                {shortenUrl}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {truncateUrl(original || "", 35)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(shortenUrl);
              }}
              className="flex-1 h-8 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex-1 h-8 text-xs"
            >
              <Link
                href={shortenUrl || `/${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkCard;
