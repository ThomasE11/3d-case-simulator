/**
 * Clinical Resources Quick Access
 * 
 * Provides quick access to:
 * - UAE Medications Database
 * - Clinical Guidelines
 * - ECG Library
 * - Educational Resources
 */

import { useState, useMemo, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BookOpen,
  Pill,
  Activity,
  GraduationCap,
  Search,
  ExternalLink,
  FileText,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { uaeMedications } from '@/data/uaeMedications';
import { clinicalGuidelines } from '@/data/clinicalGuidelines';
import { ecgLibrary } from '@/data/ecgLibrary';
import type { AssessmentGuideline } from '@/data/clinicalGuidelines';

export function ClinicalReferenceDialog({ trigger }: { trigger?: ReactNode } = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<typeof uaeMedications[0] | null>(null);
  const [selectedGuideline, setSelectedGuideline] = useState<AssessmentGuideline | null>(null);

  // Convert guidelines record to array
  const guidelinesArray = useMemo(() => Object.values(clinicalGuidelines), []);

  // Filter medications based on search
  const filteredMedications = useMemo(() => {
    if (!searchQuery) return uaeMedications.slice(0, 10);
    const query = searchQuery.toLowerCase();
    return uaeMedications.filter(med =>
      med.genericName.toLowerCase().includes(query) ||
      med.tradeNames.some(name => name.toLowerCase().includes(query)) ||
      med.class.toLowerCase().includes(query) ||
      med.indications.some(ind => ind.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Filter guidelines based on search
  const filteredGuidelines = useMemo(() => {
    if (!searchQuery) return guidelinesArray;
    const query = searchQuery.toLowerCase();
    return guidelinesArray.filter(guide =>
      guide.title.toLowerCase().includes(query) ||
      guide.category.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query) ||
      guide.keyAssessments.some(ka => ka.toLowerCase().includes(query))
    );
  }, [searchQuery, guidelinesArray]);

  // Filter ECGs based on search
  const filteredECGs = useMemo(() => {
    if (!searchQuery) return ecgLibrary.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return ecgLibrary.filter(ecg =>
      ecg.title.toLowerCase().includes(query) ||
      ecg.category.toLowerCase().includes(query) ||
      ecg.interpretation.rhythm.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Clinical Resources</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Clinical Resources Reference
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-2">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications, guidelines, ECG patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="medications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="medications" className="gap-1">
                <Pill className="h-4 w-4" />
                <span className="hidden sm:inline">Medications</span>
              </TabsTrigger>
              <TabsTrigger value="guidelines" className="gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Guidelines</span>
              </TabsTrigger>
              <TabsTrigger value="pocket" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Pocket</span>
              </TabsTrigger>
              <TabsTrigger value="pocket" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Pocket</span>
              </TabsTrigger>
              <TabsTrigger value="pocket" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Pocket</span>
              </TabsTrigger>
              <TabsTrigger value="pocket" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Pocket</span>
              </TabsTrigger>
              <TabsTrigger value="pocket" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Pocket</span>
              </TabsTrigger>
              <TabsTrigger value="pocket" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Pocket</span>
              </TabsTrigger>
              <TabsTrigger value="ecgs" className="gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">ECG Library</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="gap-1">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Education</span>
              </TabsTrigger>
            </TabsList>

            {/* Medications Tab */}
            <TabsContent value="medications" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {selectedMedication ? (
                    <Card className="border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{selectedMedication.genericName}</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMedication(null)}>
                            Back to list
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedMedication.class}</p>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">Trade Names:</p>
                          <p className="text-muted-foreground">{selectedMedication.tradeNames.join(', ')}</p>
                        </div>
                        <div>
                          <p className="font-medium">Adult Dose:</p>
                          {selectedMedication.adultDose.map((dose, i) => (
                            <p key={i} className="text-muted-foreground">
                              {dose.route}: {dose.dose} {dose.frequency && `(${dose.frequency})`}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="font-medium">Indications:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {selectedMedication.indications.map((ind, i) => (
                              <li key={i}>{ind}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-red-600">Contraindications:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {selectedMedication.contraindications.map((contra, i) => (
                              <li key={i}>{contra}</li>
                            ))}
                          </ul>
                        </div>
                        {selectedMedication.uaeSpecific.protocolNotes && (
                          <div className="bg-primary/5 p-3 rounded-lg">
                            <p className="font-medium flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              UAE Protocol Notes:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground mt-1">
                              {selectedMedication.uaeSpecific.protocolNotes.map((note, i) => (
                                <li key={i}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredMedications.map((med) => (
                      <Card key={med.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedMedication(med)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{med.genericName}</h4>
                                <Badge variant="outline" className="text-[10px]">
                                  {med.uaeSpecific.scopeLevel}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {med.tradeNames.slice(0, 2).join(', ')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {med.class}
                              </p>
                            </div>
                            <Pill className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {med.indications.slice(0, 2).map((ind, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {ind}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>


            {/* Pocket Paramedic — live clinical handbook (remedy-road). */}
            <TabsContent value="pocket" className="mt-4">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-slate-950">
                <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                    Pocket Paramedic — clinical handbook
                  </p>
                  <a
                    href="https://remedy-road.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200"
                  >
                    Open full app <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <iframe
                  title="Pocket Paramedic"
                  src="https://remedy-road.vercel.app"
                  className="h-[420px] w-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </TabsContent>
            {/* Guidelines Tab */}
            <TabsContent value="guidelines" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {selectedGuideline ? (
                    <Card className="border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{selectedGuideline.title}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {selectedGuideline.category}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedGuideline(null)}>
                            Back to list
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{selectedGuideline.description}</p>

                        <div>
                          <p className="font-medium text-sm">Key Assessments:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {selectedGuideline.keyAssessments.map((assessment, i) => (
                              <li key={i}>{assessment}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-sm text-red-600">Red Flags:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {selectedGuideline.redFlags.map((flag, i) => (
                              <li key={i}>{flag}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-sm">Mandatory Actions:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {selectedGuideline.mandatoryActions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>

                        {selectedGuideline.guidelines.length > 0 && (
                          <div className="bg-primary/5 p-3 rounded-lg">
                            <p className="font-medium text-sm flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              References:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                              {selectedGuideline.guidelines.map((ref, i) => (
                                <li key={i}>
                                  {ref.source} {ref.year} - {ref.title}
                                  {ref.url && (
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                                      <ExternalLink className="h-3 w-3 inline" />
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredGuidelines.map((guide, index) => (
                      <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedGuideline(guide)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{guide.title}</h4>
                                <Badge variant="outline" className="text-[10px]">
                                  {guide.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {guide.description}
                              </p>
                            </div>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              <span className="font-medium">Key assessments:</span> {guide.keyAssessments.slice(0, 2).join(', ')}...
                            </p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {guide.redFlags.slice(0, 3).map((flag, i) => (
                              <Badge key={i} variant="destructive" className="text-[10px]">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ECG Library Tab */}
            <TabsContent value="ecgs" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {filteredECGs.map((ecg) => (
                    <Card key={ecg.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{ecg.title}</h4>
                              <Badge 
                                variant={ecg.category === 'STEMI' ? 'destructive' : 'outline'} 
                                className="text-[10px]"
                              >
                                {ecg.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {ecg.interpretation.rhythm} @ {ecg.interpretation.rate} bpm
                            </p>
                          </div>
                          <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Key Finding:</span> {ecg.keyFindings[0]?.description}
                          </p>
                        </div>
                        {ecg.teachingPoints.length > 0 && (
                          <div className="mt-2 flex items-start gap-1">
                            <GraduationCap className="h-3 w-3 text-primary mt-0.5" />
                            <p className="text-xs text-muted-foreground">{ecg.teachingPoints[0]}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {/* Quick Links */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        External Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: 'Life in the Fast Lane (LITFL)', url: 'https://litfl.com', desc: 'ECG library and critical care' },
                        { name: 'Resus.co.uk', url: 'https://resus.org.uk', desc: 'Resuscitation guidelines' },
                        { name: 'ATLS Guidelines', url: '#', desc: 'Advanced Trauma Life Support' },
                        { name: 'ACLS Guidelines', url: '#', desc: 'Advanced Cardiac Life Support' },
                      ].map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{link.name}</p>
                            <p className="text-xs text-muted-foreground">{link.desc}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </CardContent>
                  </Card>

                  {/* UAE Specific Resources */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        UAE Specific Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Dubai Corporation for Ambulance Services (DCAS)</p>
                          <p className="text-xs text-muted-foreground">Protocol updates and training materials</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">UAE Ministry of Health</p>
                          <p className="text-xs text-muted-foreground">Prehospital care guidelines</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Poison Control Center</p>
                          <p className="text-xs text-muted-foreground">Emergency: 800-4111</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Tips */}
                  <Card className="bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Study Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Practice ECG interpretation daily - use the LITFL ECG library
                      </p>
                      <p className="text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Review medication doses weekly - focus on UAE protocols
                      </p>
                      <p className="text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Study ABCDE approach - consistency is key
                      </p>
                      <p className="text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Learn red flags for each condition
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClinicalReferenceDialog;
