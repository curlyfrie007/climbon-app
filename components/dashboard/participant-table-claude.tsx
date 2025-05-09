"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row, // Import Row type
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2, Plus, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    // AlertDialogTrigger, // Not needed if triggered programmatically
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
// Form related imports might not be needed if Edit dialog is removed
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { showParticipantKey } from "./participantKey" // Assuming this component is updated or still relevant
// Corrected Imports for hooks and types
import { useParticipantManager, StartclassKKFN, ResultKKFN, ParticipantKKFN } from "@/hooks/useParticipants";
import { toast } from "sonner"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Loader2 } from "lucide-react" // For loading states

// Helper function to calculate completed boulders
const calculateCompletedBoulders = (participant: ParticipantKKFN): number => {
    return participant.results?.boulders?.filter(b => b).length ?? 0;
};

// Helper function to format last update time
const formatLastUpdate = (participant: ParticipantKKFN): string => {
    if (!participant.results?.lastUpdateTime) {
        return "N/A";
    }
    try {
        return new Date(participant.results.lastUpdateTime).toLocaleString('de-DE', {
            year: '2-digit', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return "Invalid Date";
    }
};

export function ParticipantsTable() {
    // State for the table
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    // State for dialogs
    const [addDialogOpen, setAddDialogOpen] = React.useState(false)
    // Remove state related to Edit Results dialog
    // const [editResultsDialogOpen, setEditResultsDialogOpen] = React.useState(false)
    // const [selectedParticipant, setSelectedParticipant] = React.useState<string | null>(null)
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = React.useState(false)
    const [participantToDelete, setParticipantToDelete] = React.useState<ParticipantKKFN | null>(null) // Store full participant for context

    // New participant form state
    const [newParticipant, setNewParticipant] = React.useState({
        name: "",
        startclass: "Männlich" as StartclassKKFN, // Use correct type and default
        secret: ""
    })

    // Remove state for Edit Results form
    // const [editResults, setEditResults] = React.useState(...)

    // Get participants data and functions from the updated custom hook
    const {
        participants,
        participantsLoading,
        participantsError,
        refetchParticipants,
        createParticipant,
        createLoading,
        // updateBoulderResult, // Renamed function from the hook
        // updateLoading, // Use createLoading or deleteLoading as appropriate
        deleteParticipant, // Get delete function from manager hook
        deleteLoading, // Get delete loading state
        // deleteError // Get delete error state if needed
    } = useParticipantManager() // Use the combined manager hook

    // Fetch participants on component mount (no change needed)
    React.useEffect(() => {
        refetchParticipants()
    }, [refetchParticipants]) // Dependency array should just be refetchParticipants

    // Format start class (only M/W needed now)
    const formatStartClass = (startclass: StartclassKKFN) => {
        switch (startclass) {
            case "Männlich": return "Männlich";
            case "Weiblich": return "Weiblich";
            default: return startclass; // Fallback
        }
    }

    // Define table columns for KKFN2025
    const columns: ColumnDef<ParticipantKKFN>[] = [
        // Select (no change needed)
        {
            id: "select",
            header: ({ table }) => (<Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all"/>),
            cell: ({ row }) => (<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row"/>),
            enableSorting: false, // Usually selection columns aren't sortable
            enableHiding: false,
        },
        // Name (no change needed)
        {
            accessorKey: "name",
            header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Name <ArrowUpDown className="ml-2 h-4 w-4" /></Button>),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        // Startclass (update formatting)
        {
            accessorKey: "startclass",
            header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Startklasse <ArrowUpDown className="ml-2 h-4 w-4" /></Button>),
            cell: ({ row }) => (<div className="font-medium"><Badge variant={"outline"}>{formatStartClass(row.getValue("startclass"))}</Badge></div>),
            filterFn: (row, id, value) => { // Add filter function for exact match
                 return value.includes(row.getValue(id))
            },
        },
        // Completed Boulders (New Column)
        {
            accessorKey: "completedBoulders", // Use a descriptive key
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Tops
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            // Calculate value using helper function
            accessorFn: (row) => calculateCompletedBoulders(row),
            cell: ({ row }) => {
                const completed = calculateCompletedBoulders(row.original);
                const total = row.original.startclass === 'Weiblich' ? 28 : 35; // Target for finals
                return <div className="font-medium text-center">{completed}/{total}</div>; // Display count / target
            },
            sortingFn: 'basic', // Use basic number sorting
        },
        // Last Update Time (New Column)
         {
            accessorKey: "lastUpdate", // Use a descriptive key
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Letztes Update
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            // Format value using helper function
            accessorFn: (row) => row.results?.lastUpdateTime ? new Date(row.results.lastUpdateTime).getTime() : 0, // Sort by timestamp
            cell: ({ row }) => {
                const formattedTime = formatLastUpdate(row.original);
                return <div className="font-medium text-center">{formattedTime}</div>;
            },
            sortingFn: 'datetime', // Use datetime sorting
        },
        // Registration Date (no change needed, but ensure accessorKey matches ParticipantKKFN)
        {
            accessorKey: "registrationDate",
            header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-left">Registriert am <ArrowUpDown className="ml-2 h-4 w-4" /></Button>),
            cell: ({ row }) => {
                const date = row.getValue("registrationDate") as Date; // Cast to Date
                return <div className="text-left font-medium">{date.toLocaleString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            },
            sortingFn: 'datetime', // Use datetime sorting
        },
        // ID (no change needed)
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="sm" className="px-2" onClick={() => Copy(row.getValue("id"))}>
                                {(String(row.getValue("id")).slice(0,8)+"...")}
                                <Copy className="ml-2 h-3 w-3"/>
                             </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{row.getValue("id")}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ),
        },
        // Actions (Remove Edit Results)
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const participant = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Optionen</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="hover:cursor-pointer"
                                onClick={() => showParticipantKey(participant.secret)} // Ensure showParticipantKey is adapted if needed
                            >
                                Zugangsschlüssel
                            </DropdownMenuItem>
                            {/* Remove Edit Results Item */}
                            {/* <DropdownMenuItem ... > Ergebnisse Bearbeiten </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="hover:cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-100/10"
                                onClick={() => {
                                    setParticipantToDelete(participant) // Store participant object
                                    setConfirmDeleteDialogOpen(true)
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />Löschen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    // Initialize table with data and updated types
    const table = useReactTable({
        data: participants, // Already ParticipantKKFN[] from the hook
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        // Remove fuzzy filter if not needed or adapt
        // filterFns: { ... },
        globalFilterFn: (row: Row<ParticipantKKFN>, columnId: string, filterValue: string) => {
             const value = row.getValue(columnId);
             // Handle different types for global filter
             if (typeof value === 'string') {
                 return value.toLowerCase().includes(filterValue.toLowerCase());
             }
             if (typeof value === 'number') {
                 return value.toString().includes(filterValue);
             }
             if (value instanceof Date) {
                  return value.toLocaleString('de-DE').includes(filterValue);
             }
             // Add more type checks if needed for other columns
             return false;
        },
        // Enable filtering per column if desired
        // enableColumnFilters: true,
        // onGlobalFilterChange: setGlobalFilter, // Use state for global filter
    })

    // Handle global search (no change needed)
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value ?? '')
    }

    // Handle new participant form submission (update startclass type)
    const handleAddParticipant = async (e: React.FormEvent) => {
        e.preventDefault()
        // Basic validation
        if (!newParticipant.name.trim() || !newParticipant.secret.trim()) {
             toast.warning("Fehlende Angaben", { description: "Name und Zugangsschlüssel sind erforderlich." });
             return;
        }
        try {
            const created = await createParticipant(
                newParticipant.name.trim(),
                newParticipant.startclass, // Already correct type
                newParticipant.secret.trim()
            )
            if (created) {
                setAddDialogOpen(false)
                setNewParticipant({ name: "", startclass: "Männlich", secret: "" }) // Reset form
                refetchParticipants() // Refresh table data
                toast.success("Teilnehmer hinzugefügt", {
                    description: `${created.name} wurde erfolgreich registriert.`,
                })
            } else {
                 // Error state should be set by the hook if it returns null
                 toast.error("Fehler", { description: "Teilnehmer konnte nicht erstellt werden (möglicherweise existiert der Schlüssel bereits?)." });
            }
        } catch (error) { // Catch unexpected errors
            console.error("Error creating participant:", error);
            toast.error("Fehler", { description: "Ein unerwarteter Fehler ist aufgetreten." });
        }
    }

    // Remove handleUpdateResults function and related logic

    // Handle delete participant (use delete function from manager hook)
    const handleDeleteParticipant = async () => {
        if (!participantToDelete) return;

        try {
            const success = await deleteParticipant(participantToDelete.id); // Call hook function
            setConfirmDeleteDialogOpen(false);
            if (success) {
                refetchParticipants(); // Refresh table
                toast.success("Teilnehmer gelöscht", {
                    description: `Teilnehmer ${participantToDelete.name} wurde erfolgreich gelöscht.`,
                });
                setParticipantToDelete(null); // Clear selection
            } else {
                 // Error state might be set in the hook, or handle generic failure
                 toast.error("Fehler", { description: `Teilnehmer ${participantToDelete.name} konnte nicht gelöscht werden.` });
            }
        } catch (error) { // Catch unexpected errors
             console.error("Error deleting participant:", error);
             toast.error("Fehler", { description: "Ein unerwarteter Fehler ist aufgetreten." });
        }
         setParticipantToDelete(null); // Clear selection even on error
    }

    // Remove functions related to Edit Results dialog
    // const getSelectedParticipantData = () => { ... }
    // React.useEffect(() => { ... }, [selectedParticipant]) // Effect for edit dialog
    // const handleRouteChange = (value: string) => { ... }

    return (
        <div className="w-full p-4"> {/* Added padding */}
            <h1 className="text-3xl font-bold mb-4">Teilnehmer Verwaltung</h1> {/* Adjusted heading */}

            {/* Filters and controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 py-4"> {/* Use flex-wrap and gap */}
                <Input
                    placeholder="Suchen (Name, Klasse, ID...)" // Updated placeholder
                    value={globalFilter}
                    onChange={handleSearch}
                    className="max-w-sm h-9" // Adjusted size
                />
                <div className="flex gap-2"> {/* Group buttons */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-auto"> {/* Use size="sm" */}
                                Spalten <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table.getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {/* Improve display names */}
                                        {column.id === 'completedBoulders' ? 'Tops' :
                                         column.id === 'lastUpdate' ? 'Letztes Update' :
                                         column.id === 'registrationDate' ? 'Registriert am' :
                                         column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add participant dialog trigger */}
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"> {/* Use size="sm" */}
                                <Plus className="mr-2 h-4 w-4" />Teilnehmer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Neuen Teilnehmer hinzufügen</DialogTitle>
                                <DialogDescription>
                                    Tragen Sie die Daten des neuen Teilnehmers ein. Der Zugangsschlüssel wird für den Login benötigt.
                                </DialogDescription>
                            </DialogHeader>
                            {/* Add Participant Form */}
                            <form onSubmit={handleAddParticipant} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={newParticipant.name} onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })} required disabled={createLoading}/>
                                </div>
                                <div>
                                    <Label htmlFor="startclass">Startklasse</Label>
                                    <Select value={newParticipant.startclass} onValueChange={(value) => setNewParticipant({ ...newParticipant, startclass: value as StartclassKKFN })} disabled={createLoading}>
                                        <SelectTrigger id="startclass"><SelectValue placeholder="Wählen Sie eine Klasse" /></SelectTrigger>
                                        <SelectContent>
                                            {/* Updated start classes */}
                                            <SelectItem value="Männlich">Männlich</SelectItem>
                                            <SelectItem value="Weiblich">Weiblich</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="secret">Zugangsschlüssel</Label>
                                    <Input id="secret" type="text" value={newParticipant.secret} onChange={(e) => setNewParticipant({ ...newParticipant, secret: e.target.value })} required disabled={createLoading}/>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} disabled={createLoading}>Abbrechen</Button>
                                    <Button type="submit" disabled={createLoading}>
                                        {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Speichern
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Participants table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {participantsLoading ? (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
                        ) : participantsError ? (
                             <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-red-600">Fehler beim Laden: {participantsError}</TableCell></TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Keine Teilnehmer gefunden.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4"> {/* Changed to justify-between */}
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} von{" "}
                    {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.
                </div>
                <div className="flex items-center space-x-2"> {/* Group pagination controls */}
                     <div className="hidden items-center gap-2 lg:flex"> {/* Rows per page */}
                        <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">Zeilen pro Seite</Label>
                        <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => { table.setPageSize(Number(value)) }}>
                            <SelectTrigger size="sm" className="w-20 h-8" id="rows-per-page"><SelectValue placeholder={table.getState().pagination.pageSize} /></SelectTrigger>
                            <SelectContent side="top">{ [10, 20, 30, 40, 50].map((pageSize) => (<SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>)) }</SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium"> {/* Page x of y */}
                        Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1"> {/* Navigation buttons */}
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><span className="sr-only">Erste Seite</span><IconChevronsLeft className="h-4 w-4"/></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><span className="sr-only">Vorherige Seite</span><IconChevronLeft className="h-4 w-4"/></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><span className="sr-only">Nächste Seite</span><IconChevronRight className="h-4 w-4"/></Button>
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><span className="sr-only">Letzte Seite</span><IconChevronsRight className="h-4 w-4"/></Button>
                    </div>
                </div>
            </div>

            {/* Remove Edit Results Dialog */}

            {/* Confirm Delete Dialog */}
            <AlertDialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Teilnehmer löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Soll der Teilnehmer <span className="font-semibold">{participantToDelete?.name ?? ''}</span> wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteParticipant}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" // Use destructive theme colors
                            disabled={deleteLoading}
                        >
                             {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

