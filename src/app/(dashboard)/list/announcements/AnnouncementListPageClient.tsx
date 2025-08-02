"use client";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import AnnouncementsTableWithPreview from "@/components/announcements/AnnouncementsTableWithPreview";
import TableSearch from "@/components/TableSearch";
import ListPageActions from "@/components/ui/list-page-actions";
import { Card } from "@/components/ui/card";
import { Announcement, Class } from "@prisma/client";
import { Megaphone } from "lucide-react";

type AnnouncementList = Announcement & { class: Class };

interface AnnouncementListPageClientProps {
  data: AnnouncementList[];
  count: number;
  page: number;
  columns: any[];
  isAdmin: boolean;
}

const AnnouncementListPageClient = ({ data, count, page, columns, isAdmin }: AnnouncementListPageClientProps) => {
  return (
    <Card className="space-y-6" fullWidth fullHeight background="transparent" border={false} shadow="none" padding="lg">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Megaphone className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Announcements</h1>
            <p className="text-secondary-500 text-sm">Manage school-wide communications</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TableSearch />
          <ListPageActions
            filterText="Filter"
            sortText="Sort"
            filterAction="Filter announcements"
            sortAction="Sort announcements"
          />
          {isAdmin && (
            <FormContainer table="announcement" type="create" />
          )}
        </div>
      </div>

      {/* LIST */}
      <AnnouncementsTableWithPreview
        announcements={data}
        columns={columns}
        isAdmin={isAdmin}
      />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </Card>
  );
};

export default AnnouncementListPageClient;