# Read original clean file
$lines = Get-Content "src\pages\BecomeProvider.tsx" -Encoding UTF8

# Part 1: lines 1..584 (indices 0..583), but replace import line and add wizard state
$part1 = @()
for ($i = 0; $i -lt 584; $i++) {
    $line = $lines[$i]
    # Fix import: add useRef
    if ($line -match "^import \{ useState, useCallback \}") {
        $line = 'import { useState, useCallback, useRef } from "react";'
    }
    # After showConsent state add wizard state
    if ($line -match "const \[consentAccepted") {
        $part1 += $line
        $part1 += "  // Wizard state"
        $part1 += "  const TOTAL_STEPS = 6;"
        $part1 += "  const [currentStep, setCurrentStep] = useState(1);"
        $part1 += "  const formTopRef = useRef<HTMLDivElement>(null);"
        $part1 += "  const scrollToTop = () => { formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };"
        $part1 += "  const goNext = () => { setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS)); scrollToTop(); };"
        $part1 += "  const goBack = () => { setCurrentStep(s => Math.max(s - 1, 1)); scrollToTop(); };"
        continue
    }
    # Add distanceFromShore after description field
    if ($line -match 'description: "",$') {
        $part1 += $line
        $part1 += '    distanceFromShore: "",'
        continue
    }
    # Add masterTerms to declarations
    if ($line -match 'dataTransfer: false,$') {
        $part1 += $line
        $part1 += '    masterTerms: false,'
        continue
    }
    # Update handleSubmit check
    if ($line -match "if \(!declarations\.ownership.*!declarations\.dataTransfer\) return;") {
        $line = "    if (!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer || !declarations.masterTerms) return;"
    }
    $part1 += $line
}

# Part 2: The wizard JSX (replaces form and everything after from line 585)
$part2 = @'

            {/* Scroll anchor */}
            <div ref={formTopRef} className="scroll-mt-4" />

            {/* Step Progress Bar */}
            <div className="bg-card rounded-xl p-5 shadow-card mb-6 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {currentStep === 1 && "📍 Basic Information"}
                  {currentStep === 2 && "⛵ Mooring Details"}
                  {currentStep === 3 && "💰 Pricing & Add-Ons"}
                  {currentStep === 4 && "📸 Photos & Calendar"}
                  {currentStep === 5 && "📞 Contact Information"}
                  {currentStep === 6 && "✅ Digital Consent"}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
                  <div key={step} className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${step < currentStep ? "bg-secondary" : step === currentStep ? "bg-secondary/60" : "bg-muted"}`} />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1 */}
              {currentStep === 1 && (
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Anchor className="text-secondary" size={24} /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="mooringName">{t('provider.mooringName')} *</Label>
                    <Input id="mooringName" placeholder={t('provider.mooringNamePlaceholder')} value={formData.mooringName} onChange={(e) => setFormData(prev => ({ ...prev, mooringName: e.target.value }))} className="mt-2" required />
                  </div>
                  <div>
                    <Label>{t('provider.country')} *</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder={t('provider.selectCountry')} /></SelectTrigger>
                      <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="region">{t('provider.region')} *</Label>
                    <Input id="region" placeholder={t('provider.regionPlaceholder')} value={formData.region} onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))} className="mt-2" required />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2"><MapPin size={16} className="text-secondary" />{t('provider.coordinates')} *</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 mb-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                        <Input placeholder="e.g. 43.5081" value={formData.latitude} onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))} required type="number" step="0.000001" min="-90" max="90" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                        <Input placeholder="e.g. 16.4402" value={formData.longitude} onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))} required type="number" step="0.000001" min="-180" max="180" />
                      </div>
                    </div>
                    <CoordinatePickerMap latitude={formData.latitude} longitude={formData.longitude} onCoordinatesChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))} />
                  </div>
                  <div>
                    <Label htmlFor="distanceFromShore">🌊 Distance from Shore (meters)</Label>
                    <Input id="distanceFromShore" type="number" placeholder="e.g. 50" min="0" value={formData.distanceFromShore} onChange={(e) => setFormData(prev => ({ ...prev, distanceFromShore: e.target.value }))} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">Approximate distance from the nearest shore or dock</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">{t('provider.description')} *</Label>
                    <Textarea id="description" placeholder={t('provider.descriptionPlaceholder')} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="mt-2 min-h-[120px]" maxLength={500} required />
                    <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 characters</p>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <Button type="button" onClick={goNext} className="bg-gradient-ocean font-semibold px-8 h-11">
                    Next: Mooring Details <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="text-secondary" size={24} /> Mooring Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>{t('provider.windProtection')} *</Label>
                    <Select value={formData.windProtection} onValueChange={(value) => setFormData(prev => ({ ...prev, windProtection: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">🛡️ {t('provider.excellent')}</SelectItem>
                        <SelectItem value="good">✅ {t('provider.good')}</SelectItem>
                        <SelectItem value="moderate">⚠️ {t('provider.moderate')}</SelectItem>
                        <SelectItem value="poor">❌ {t('provider.poor')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxBoatLength">{t('provider.maxBoatLength')} *</Label>
                    <Input id="maxBoatLength" type="number" placeholder="15" value={formData.maxBoatLength} onChange={(e) => setFormData(prev => ({ ...prev, maxBoatLength: e.target.value }))} className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="maxDraft">{t('provider.maxDraft')} *</Label>
                    <Input id="maxDraft" type="number" step="0.1" placeholder="3.5" value={formData.maxDraft} onChange={(e) => setFormData(prev => ({ ...prev, maxDraft: e.target.value }))} className="mt-2" required />
                  </div>
                  <div>
                    <Label>{t('provider.mooringUnits')}</Label>
                    <Select value={formData.mooringUnits} onValueChange={(value) => setFormData(prev => ({ ...prev, mooringUnits: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="1" /></SelectTrigger>
                      <SelectContent>{Array.from({ length: 20 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">{t('provider.mooringUnitsDesc')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>{t('provider.amenities')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {amenities.map((a) => (
                        <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.amenities.includes(a.id) ? "bg-secondary/10 border-secondary text-secondary" : "bg-muted border-border text-muted-foreground hover:border-secondary/50"}`}>
                          <span>{a.icon}</span><span className="text-sm font-medium">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
                  <Button type="button" onClick={goNext} className="bg-gradient-ocean font-semibold px-8 h-11">
                    Next: Pricing <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Snowflake className="text-secondary" size={24} />{t('provider.winterBerth')}
                  </h2>
                  <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">{t('provider.offerWinterStorage')}</Label>
                      <p className="text-sm text-muted-foreground">{t('provider.winterSeason')}</p>
                    </div>
                    <Switch checked={formData.winterStorage} onCheckedChange={(c) => setFormData(prev => ({ ...prev, winterStorage: c }))} />
                  </div>
                  {formData.winterStorage && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>{t('provider.winterStorageType')} *</Label>
                        <Select value={formData.winterStorageType} onValueChange={(v: "wet"|"dry"|"both") => setFormData(prev => ({ ...prev, winterStorageType: v }))}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wet">🌊 {t('provider.wetStorage')}</SelectItem>
                            <SelectItem value="dry">🏗️ {t('provider.dryStorage')}</SelectItem>
                            <SelectItem value="both">🔄 {t('provider.bothStorage')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="winterPrice">{t('provider.winterPriceMonthly')} *</Label>
                        <Input id="winterPrice" type="number" placeholder="250" value={formData.winterPriceMonthly} onChange={(e) => setFormData(prev => ({ ...prev, winterPriceMonthly: e.target.value }))} className="mt-2" />
                      </div>
                      <div className="md:col-span-2">
                        <Label>{t('provider.winterServices')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {winterServices.map((s) => (
                            <button key={s.id} type="button" onClick={() => toggleWinterService(s.id)}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.winterServices.includes(s.id) ? "bg-secondary/10 border-secondary text-secondary" : "bg-muted border-border text-muted-foreground hover:border-secondary/50"}`}>
                              <span>{s.icon}</span><span className="text-sm font-medium">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <CreditCard className="text-secondary" size={24} />{t('provider.pricingPayment')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pricePerNight">{t('provider.pricePerNight')} *</Label>
                      <Input id="pricePerNight" type="number" placeholder="45" value={formData.pricePerNight} onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))} className="mt-2" required />
                    </div>
                    <div>
                      <Label>{t('provider.discount')}: {formData.discount[0]}%</Label>
                      <Slider value={formData.discount} onValueChange={(v) => setFormData(prev => ({ ...prev, discount: v }))} min={0} max={50} step={5} className="mt-4" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>0%</span><span>50%</span></div>
                    </div>
                    <div className="md:col-span-2">
                      <Label>{t('provider.paymentMethods')} *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                        {paymentMethods.map((m) => (
                          <button key={m.id} type="button" onClick={() => togglePayment(m.id)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.paymentMethods.includes(m.id) ? "bg-secondary/10 border-secondary text-secondary" : "bg-muted border-border text-muted-foreground hover:border-secondary/50"}`}>
                            <span>{m.icon}</span><span className="text-sm font-medium">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className={`p-4 rounded-lg border-2 transition-all ${formData.now4today ? 'border-orange-500 bg-orange-500/5' : 'border-border'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                              <Zap className="text-orange-500" size={20} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">Now4Today</h3>
                              <p className="text-sm text-muted-foreground">{t('provider.now4todayDesc')}</p>
                            </div>
                          </div>
                          <Switch checked={formData.now4today} onCheckedChange={(c) => setFormData(prev => ({ ...prev, now4today: c }))} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Crown className="text-gold" size={24} />{t('provider.premiumAddOns')}
                  </h2>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${formData.marketingTools ? 'border-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Megaphone className="text-gold" size={20} />
                          <div><h3 className="font-semibold">{t('provider.marketingTools')}</h3><p className="text-sm text-muted-foreground">€5/mo</p></div>
                        </div>
                        <Switch checked={formData.marketingTools} onCheckedChange={(c) => setFormData(prev => ({ ...prev, marketingTools: c }))} />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${formData.premiumListing ? 'border-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="text-gold" size={20} />
                          <div><h3 className="font-semibold">{t('provider.premiumListing')}</h3><p className="text-sm text-muted-foreground">€9.99/mo</p></div>
                        </div>
                        <Switch checked={formData.premiumListing} onCheckedChange={(c) => setFormData(prev => ({ ...prev, premiumListing: c }))} />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${formData.insuranceMediation ? 'border-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="text-emerald-500" size={20} />
                          <div><h3 className="font-semibold">{t('provider.mooringInsurance')}</h3><p className="text-sm text-muted-foreground">€9.99/yr</p></div>
                        </div>
                        <Switch checked={formData.insuranceMediation} onCheckedChange={(c) => setFormData(prev => ({ ...prev, insuranceMediation: c }))} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
                  <Button type="button" onClick={goNext} className="bg-gradient-ocean font-semibold px-8 h-11">
                    Next: Photos &amp; Calendar <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Camera className="text-secondary" size={24} />{t('provider.uploadPhotos')}
                  </h2>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Upload className="mx-auto text-muted-foreground mb-4" size={40} />
                    <p className="text-muted-foreground">{t('provider.dragDrop')}</p>
                    <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] })); }} />
                  </div>
                  {formData.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                      {formData.photos.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img src={URL.createObjectURL(file)} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <AdBanner position="inline" size="medium" />
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Calendar className="text-secondary" size={24} />{t('provider.calendar')}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">{t('provider.calendarDesc')}</p>
                  <MonthlyCalendar year={2026} calendarDays={calendarDays} onToggle={toggleCalendarDay} onPriceChange={handleDayPriceChange} basePrice={formData.pricePerNight ? parseFloat(formData.pricePerNight) : undefined} />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
                  <Button type="button" onClick={goNext} className="bg-gradient-ocean font-semibold px-8 h-11">
                    Next: Contact Info <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="text-secondary" size={24} />{t('provider.contactInfo')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="address">{t('provider.address')} *</Label>
                    <Input id="address" placeholder={t('provider.addressPlaceholder')} value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('provider.phone')} *</Label>
                    <Input id="phone" type="tel" placeholder="+385 99 123 4567" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="flex items-center gap-2"><MessageSquare size={14} className="text-success" />WhatsApp (optional)</Label>
                    <Input id="whatsapp" type="tel" placeholder="+385 99 123 4567" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} className="mt-2" />
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
                  <Button type="button" onClick={goNext} className="bg-gradient-ocean font-semibold px-8 h-11">
                    Next: Digital Consent <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
              )}

              {/* STEP 6 */}
              {currentStep === 6 && (
              <div className="bg-card rounded-xl p-6 shadow-card border-2 border-secondary/30">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="text-secondary" size={24} />Digital Consent &amp; Master Terms of Service
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Please read and accept all terms before publishing your mooring profile.</p>
                <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed max-h-52 overflow-y-auto mb-6 border border-border">
                  <h3 className="font-semibold mb-2 text-foreground">Master Terms of Service — Summary</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    <li>I confirm ownership or long-term lease of the listed mooring(s).</li>
                    <li>I agree that Mooring Booking charges 15% commission on all bookings.</li>
                    <li>I consent to data transfer to any successor entity in the event of a sale or acquisition.</li>
                    <li>I understand the Platform is "AS IS" and Mooring Booking.com is not liable for incidents.</li>
                    <li>I accept mandatory arbitration under Austrian/EU law.</li>
                    {formData.marketingTools && <li>I agree to the €5/month charge for Marketing Tools.</li>}
                    {formData.premiumListing && <li>I agree to the €9.99/month charge for Premium Listing.</li>}
                    {formData.insuranceMediation && <li>I agree to the €9.99/year charge for Insurance Mediation.</li>}
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox id="ownership" checked={declarations.ownership} onCheckedChange={(c) => setDeclarations(prev => ({ ...prev, ownership: c as boolean }))} />
                    <Label htmlFor="ownership" className="text-sm leading-relaxed cursor-pointer">{t('provider.declaration1')}</Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox id="commission" checked={declarations.commission} onCheckedChange={(c) => setDeclarations(prev => ({ ...prev, commission: c as boolean }))} />
                    <Label htmlFor="commission" className="text-sm leading-relaxed cursor-pointer">{t('provider.declaration2')}</Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox id="dataTransfer" checked={declarations.dataTransfer} onCheckedChange={(c) => setDeclarations(prev => ({ ...prev, dataTransfer: c as boolean }))} />
                    <Label htmlFor="dataTransfer" className="text-sm leading-relaxed cursor-pointer">I consent to the transfer of my data to any successor entity in the event of a sale or acquisition.</Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox id="terms" checked={declarations.terms} onCheckedChange={(c) => setDeclarations(prev => ({ ...prev, terms: c as boolean }))} />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">{t('provider.termsAgree')}</Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <Checkbox id="masterTerms" checked={declarations.masterTerms} onCheckedChange={(c) => setDeclarations(prev => ({ ...prev, masterTerms: c as boolean }))} />
                    <Label htmlFor="masterTerms" className="text-sm leading-relaxed cursor-pointer font-medium">
                      ✅ I have read and digitally consent to the Master Terms of Service, Privacy Policy, GDPR Policy, and all applicable terms above. This constitutes a legally binding digital agreement under EU eIDAS regulation.
                    </Label>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={goBack}>← Back</Button>
                  <Button type="submit" className="bg-gradient-ocean font-semibold h-12 px-8"
                    disabled={!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer || !declarations.masterTerms}>
                    <QrCode className="mr-2" size={20} />{t('provider.publishProfile')}
                  </Button>
                </div>
              </div>
              )}

            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeProviderPage;
'@

# Combine: lines 1..584 + part2
$combined = $part1 + ($part2 -split "`n")

# Write to file
$combined | Set-Content "src\pages\BecomeProvider.tsx" -Encoding UTF8

Write-Host "Done! Total lines: $($combined.Count)"
