
'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import React from "react";

interface ProductFiltersProps {
    origins: string[];
    textures: string[];
}

export function ProductFilters({ origins, textures }: ProductFiltersProps) {
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

    const handleRangeChange = useDebouncedCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    }, 500);

    const clearFilters = () => {
        replace(pathname);
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
                
                <Accordion type="multiple" defaultValue={['texture', 'origin', 'price', 'length']} className="w-full">
                    <AccordionItem value="texture">
                        <AccordionTrigger className="font-semibold">Texture</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                           {textures.map(texture => (
                                <div key={texture} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`texture-${texture}`} 
                                        onCheckedChange={() => handleMultiSelectChange('texture', texture)}
                                        checked={searchParams.get('texture')?.split(',').includes(texture)}
                                    />
                                    <Label htmlFor={`texture-${texture}`} className="font-normal">{texture}</Label>
                                </div>
                           ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="origin">
                        <AccordionTrigger className="font-semibold">Origin</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                           {origins.map(origin => (
                                <div key={origin} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`origin-${origin}`} 
                                        onCheckedChange={() => handleMultiSelectChange('origin', origin)}
                                        checked={searchParams.get('origin')?.split(',').includes(origin)}
                                    />
                                    <Label htmlFor={`origin-${origin}`} className="font-normal">{origin}</Label>
                                </div>
                           ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price">
                        <AccordionTrigger className="font-semibold">Price Range</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                            <div className="flex gap-2">
                                <Input 
                                    type="number" 
                                    placeholder="Min" 
                                    onChange={(e) => handleRangeChange('minPrice', e.target.value)}
                                    defaultValue={searchParams.get('minPrice') || ''}
                                />
                                <Input 
                                    type="number" 
                                    placeholder="Max" 
                                    onChange={(e) => handleRangeChange('maxPrice', e.target.value)}
                                    defaultValue={searchParams.get('maxPrice') || ''}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="length">
                        <AccordionTrigger className="font-semibold">Length (inches)</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                            <div className="flex gap-2">
                                <Input 
                                    type="number" 
                                    placeholder="Min" 
                                    onChange={(e) => handleRangeChange('minLength', e.target.value)}
                                    defaultValue={searchParams.get('minLength') || ''}
                                />
                                <Input 
                                    type="number" 
                                    placeholder="Max" 
                                    onChange={(e) => handleRangeChange('maxLength', e.target.value)}
                                    defaultValue={searchParams.get('maxLength') || ''}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button variant="ghost" onClick={clearFilters} className="w-full">Clear All Filters</Button>
            </CardContent>
      </Card>
    );
}
