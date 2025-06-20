
import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { Tables } from "@/integrations/supabase/types";
import { CampaignDialog } from "@/components/CampaignDialog";
import { CampaignTable } from "@/components/CampaignTable";
import { useTranslation } from "react-i18next";

type Campaign = Tables<'campaigns'>;

const CampaignsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
  const { t } = useTranslation();

  const handleOpenDialog = (campaign: Campaign | null = null) => {
    setSelectedCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCampaign(null);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('campaigns.title')}</h1>
          <p className="text-muted-foreground">{t('campaigns.description')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('campaigns.add_campaign')}
        </Button>
      </div>
      <div className="mt-4">
        <CampaignTable onEdit={handleOpenDialog} />
      </div>
      <CampaignDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        campaign={selectedCampaign}
      />
    </DashboardLayout>
  );
};

export default CampaignsPage;
