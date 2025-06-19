
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import { useCampaignMessages } from '@/hooks/useCampaignMessages';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export const CampaignMessages: React.FC = () => {
  const { t } = useTranslation();
  const {
    campaignMessages,
    messageResponses,
    modificationRequests,
    isLoading,
    processMessages,
    approveModification,
    rejectModification,
    isProcessing,
  } = useCampaignMessages();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancel':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'modify':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t('campaign_messages.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('campaign_messages.page_title')}</h2>
          <p className="text-muted-foreground">
            {t('campaign_messages.page_description')}
          </p>
        </div>
        <Button 
          onClick={() => processMessages()}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          {t('campaign_messages.process_messages')}
        </Button>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">
            {t('campaign_messages.tab_messages')} ({campaignMessages?.length || 0})
          </Tab

sTrigger>
          <TabsTrigger value="responses">
            {t('campaign_messages.tab_responses')} ({messageResponses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="modifications">
            {t('campaign_messages.tab_modifications')} ({modificationRequests?.filter(r => r.status === 'pending').length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {campaignMessages?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('campaign_messages.no_messages')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaignMessages?.map((message) => (
                <Card key={message.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {message.campaigns?.name}
                      </CardTitle>
                      <Badge className={getStatusColor(message.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(message.status)}
                          {t(`campaign_messages.status_${message.status}`)}
                        </div>
                      </Badge>
                    </div>
                    <CardDescription>
                      To: {message.customers?.full_name} via {message.communication_method.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">{message.message_content}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{t('campaign_messages.created')}: {format(new Date(message.created_at), 'PPp')}</span>
                        {message.sent_at && (
                          <span>{t('campaign_messages.sent')}: {format(new Date(message.sent_at), 'PPp')}</span>
                        )}
                        <span>{t('campaign_messages.expires')}: {format(new Date(message.expires_at), 'PPp')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          {messageResponses?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('campaign_messages.no_responses')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {messageResponses?.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getResponseTypeIcon(response.response_type)}
                        {t(`campaign_messages.response_${response.response_type}`)}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(response.responded_at), 'PPp')}
                      </span>
                    </div>
                    <CardDescription>
                      {t('campaign_messages.customer')}: {response.campaign_messages?.customers?.full_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>{t('campaign_messages.campaign')}:</strong> {response.campaign_messages?.campaigns?.name}
                      </p>
                      <p className="text-sm">
                        <strong>{t('campaign_messages.booking')}:</strong> {format(new Date(response.campaign_messages?.bookings?.booking_time), 'PPp')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="modifications" className="space-y-4">
          {modificationRequests?.filter(r => r.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('campaign_messages.no_modifications')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {modificationRequests?.filter(r => r.status === 'pending').map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{t('campaign_messages.booking_modification_request')}</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {t('campaign_messages.pending')}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t('campaign_messages.requested')}: {format(new Date(request.created_at), 'PPp')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">{t('campaign_messages.original_time')}:</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.bookings?.booking_time), 'PPp')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('campaign_messages.requested_time')}:</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.requested_booking_time), 'PPp')}
                          </p>
                        </div>
                      </div>
                      {request.notes && (
                        <div>
                          <p className="text-sm font-medium">{t('campaign_messages.notes')}:</p>
                          <p className="text-sm text-muted-foreground">{request.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveModification(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('campaign_messages.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectModification(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('campaign_messages.reject')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
