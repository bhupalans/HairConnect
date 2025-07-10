'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface ProductFiltersProps {
    categories: { name: string; icon: string; }[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleSearch = useDebouncedCallback((term: string) => {
        handleFilterChange('query', term);
    }, 300);

    return (
        <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by name..." 
                    className="pl-10" 
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('query')?.toString()}
                />
            </div>
            <Select 
                onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
                defaultValue={searchParams.get('category') || 'all'}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                onValueChange={(value) => handleFilterChange('sort', value === 'default' ? '' : value)}
                defaultValue={searchParams.get('sort') || 'default'}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Sort by Price" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
            </Select>
            </div>
      </div>
    );
}
