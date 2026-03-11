'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TVSeries } from '@/types/admin';
import { WizardStepper } from '@/components/admin/tv-series/wizard-stepper';
import { Step1TMDBSearch } from '@/components/admin/tv-series/step1-tmdb-search';
import { Step2Seasons } from '@/components/admin/tv-series/step2-seasons';
import { Step3Episodes } from '@/components/admin/tv-series/step3-episodes';
import { Step4StreamLinks } from '@/components/admin/tv-series/step4-stream-links';
import { Step5DownloadLinks } from '@/components/admin/tv-series/step5-download-links';

const WIZARD_STEPS = [
  { id: 1, title: 'TMDB Search', description: 'Find & import series' },
  { id: 2, title: 'Seasons', description: 'Manage seasons' },
  { id: 3, title: 'Episodes', description: 'Manage episodes' },
  { id: 4, title: 'Stream Links', description: 'Add streaming sources' },
  { id: 5, title: 'Download Links', description: 'Add download sources' },
];

export default function CreateTVSeriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [tvSeriesData, setTvSeriesData] = useState<Partial<TVSeries>>({
    seasons: [],
    poster_urls: ['', '', ''],
    backdrop_urls: ['', '', ''],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateData = (data: Partial<TVSeries>) => {
    setTvSeriesData(data);
  };

  const handleNext = () => {
    // Validation before moving to next step
    if (currentStep === 1 && !tvSeriesData.tmdb_id) {
      toast({
        title: 'Required',
        description: 'Please search and select a TV series from TMDB first.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push('/admin/tv-series');
  };

  const handleSave = async () => {
    // Final validation
    if (!tvSeriesData.tmdb_id) {
      toast({
        title: 'Validation Error',
        description: 'TV series data is incomplete.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call API to save TV series
      console.log('Saving TV series:', tvSeriesData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Success',
        description: 'TV series created successfully!',
      });

      router.push('/admin/tv-series');
    } catch (error) {
      console.error('Error saving TV series:', error);
      toast({
        title: 'Error',
        description: 'Failed to save TV series. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1TMDBSearch data={tvSeriesData} onUpdate={handleUpdateData} />;
      case 2:
        return <Step2Seasons data={tvSeriesData} onUpdate={handleUpdateData} />;
      case 3:
        return <Step3Episodes data={tvSeriesData} onUpdate={handleUpdateData} />;
      case 4:
        return <Step4StreamLinks data={tvSeriesData} onUpdate={handleUpdateData} />;
      case 5:
        return <Step5DownloadLinks data={tvSeriesData} onUpdate={handleUpdateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TV Series
        </button>
        <h1 className="text-3xl font-bold text-foreground">Create TV Series</h1>
        <p className="text-muted-foreground mt-2">
          Add a new TV series with complete season and episode information
        </p>
      </div>

      <WizardStepper steps={WIZARD_STEPS} currentStep={currentStep} />

      <div className="bg-card border border-border rounded-lg p-6 min-h-[500px]">
        {renderStep()}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="border-border text-foreground hover:bg-white/5"
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-border text-foreground hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}

          {currentStep < WIZARD_STEPS.length ? (
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create TV Series
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Data Summary Panel (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
              Debug: Current Data
            </summary>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-96 scrollbar-hide">
              {JSON.stringify(tvSeriesData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
