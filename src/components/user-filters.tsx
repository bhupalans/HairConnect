
'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, BadgeCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import React from "react";

interface UserFiltersProps {
    userType: 'seller' | 'buyer';
    locations: string[];
    buyerTypes?: string[];
    yearsInBusiness?: string[];
}

export function UserFilters({ userType, locations, buyerTypes, yearsInBusiness }: UserFiltersProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);
    
    const handleMultiSelectChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValues = params.get(key)?.split(',') || [];
        const newValues = currentValues.includes(value) 
            ? currentValues.filter(v => v !== value) 
            : [...currentValues, value];
            
        if (newValues.length > 0) {
            params.set(key, newValues.join(','));
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleCheckboxChange = (key: string, checked: boolean | string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (checked) {
            params.set(key, 'true');
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    }

    const clearFilters = () => {
        replace(pathname);
    }

    const defaultAccordionItems = ['location'];
    if (userType === 'buyer') {
        defaultAccordionItems.push('buyerType', 'yearsInBusiness');
    } else {
        defaultAccordionItems.push('status');
    }

    return (
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name..." 
                        className="pl-10" 
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('query')?.toString()}
                    />
                </div>
                
                <Accordion type="multiple" defaultValue={defaultAccordionItems} className="w-full">
                    {userType === 'seller' && (
                         <AccordionItem value="status">
                            <AccordionTrigger className="font-semibold">Status</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="verified-seller" 
                                        onCheckedChange={(checked) => handleCheckboxChange('verified', checked)}
                                        checked={searchParams.get('verified') === 'true'}
                                    />
                                    <Label htmlFor="verified-seller" className="font-normal flex items-center gap-1"><BadgeCheck className="h-4 w-4 text-blue-600"/> Verified Sellers Only</Label>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    <AccordionItem value="location">
                        <AccordionTrigger className="font-semibold">Location (Country)</AccordionTrigger>
                        <AccordionContent className="space-y-2 max-h-60 overflow-y-auto">
                           {locations.map(location => (
                                <div key={location} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`location-${location}`} 
                                        onCheckedChange={() => handleMultiSelectChange('location', location)}
                                        checked={searchParams.get('location')?.split(',').includes(location)}
                                    />
                                    <Label htmlFor={`location-${location}`} className="font-normal">{location}</Label>
                                </div>
                           ))}
                        </AccordionContent>
                    </AccordionItem>
                     {userType === 'buyer' && buyerTypes && (
                        <AccordionItem value="buyerType">
                            <AccordionTrigger className="font-semibold">Business Type</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                            {buyerTypes.map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`type-${type}`} 
                                            onCheckedChange={() => handleMultiSelectChange('buyerType', type)}
                                            checked={searchParams.get('buyerType')?.split(',').includes(type)}
                                        />
                                        <Label htmlFor={`type-${type}`} className="font-normal capitalize">{type.replace('-', ' ')}</Label>
                                    </div>
                            ))}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    {userType === 'buyer' && yearsInBusiness && (
                        <AccordionItem value="yearsInBusiness">
                            <AccordionTrigger className="font-semibold">Years in Business</AccordionTrigger>
                            <AccordionContent className="space-y-2">
                            {yearsInBusiness.map(years => (
                                    <div key={years} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`years-${years}`} 
                                            onCheckedChange={() => handleMultiSelectChange('yearsInBusiness', years)}
                                            checked={searchParams.get('yearsInBusiness')?.split(',').includes(years)}
                                        />
                                        <Label htmlFor={`years-${years}`} className="font-normal">{years} years</Label>
                                    </div>
                            ))}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>

                <Button variant="ghost" onClick={clearFilters} className="w-full">Clear All Filters</Button>
            </CardContent>
      </Card>
    );
}
