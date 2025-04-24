"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Archive,
    ArrowLeft,
    Clock,
    Edit,
    Inbox,
    Loader2,
    Mail,
    MoreHorizontal,
    Paperclip,
    Search,
    Send,
    Star,
    Trash2,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

// Types for our messages
type MessagePriority = "low" | "medium" | "high"
type MessageStatus = "unread" | "read" | "archived"

interface Message {
    id: string
    sender: {
        name: string
        email: string
        avatar?: string
    }
    subject: string
    preview: string
    content: string
    timestamp: string
    priority: MessagePriority
    status: MessageStatus
    isStarred: boolean
}

// Sample data
const messages: Message[] = [
    {
        id: "1",
        sender: {
            name: "Promesses Mus",
            email: "promessesmus@gsolutech.org",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        subject: "Invitation à la conférence annuelle",
        preview: "Nous sommes ravis de vous inviter à notre conférence annuelle qui se tiendra...",
        content:
            "Nous sommes ravis de vous inviter à notre conférence annuelle qui se tiendra le 15 novembre 2023 à l'hôtel Marriott. Veuillez confirmer votre présence avant le 1er novembre.",
        timestamp: "10:30 AM",
        priority: "high",
        status: "unread",
        isStarred: true,
    },
    {
        id: "2",
        sender: {
            name: "Greg B",
            email: "gregmalos@gmail.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        subject: "Mise à jour du projet Kivu",
        preview: "Voici les dernières mises à jour concernant le projet Kivu...",
        content:
            "Voici les dernières mises à jour concernant le projet Kivu. Nous avons terminé la phase 1 et nous sommes prêts à passer à la phase 2. Veuillez consulter les documents ci-joints pour plus de détails.",
        timestamp: "Hier",
        priority: "medium",
        status: "read",
        isStarred: false,
    },
    {
        id: "3",
        sender: {
            name: "Yves Kab",
            email: "yveskab@icloud.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        subject: "Demande de participation",
        preview: "J'aimerais participer à l'événement du mois prochain...",
        content:
            "J'aimerais participer à l'événement du mois prochain. Pourriez-vous me donner plus d'informations sur les modalités d'inscription et les frais de participation ?",
        timestamp: "2 jours",
        priority: "low",
        status: "unread",
        isStarred: false,
    },
    {
        id: "4",
        sender: {
            name: "huitieme HK",
            email: "hk243@gmail.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        subject: "Rapport trimestriel",
        preview: "Veuillez trouver ci-joint le rapport trimestriel pour Q3 2023...",
        content:
            "Veuillez trouver ci-joint le rapport trimestriel pour Q3 2023. Les résultats sont très encourageants, avec une augmentation de 15% des inscriptions par rapport au trimestre précédent.",
        timestamp: "3 jours",
        priority: "medium",
        status: "read",
        isStarred: true,
    },
    {
        id: "5",
        sender: {
            name: "Équipe Technique",
            email: "tech@kivuevent.app",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        subject: "Maintenance planifiée",
        preview: "Une maintenance du système est prévue ce weekend...",
        content:
            "Une maintenance du système est prévue ce weekend, du samedi 22h au dimanche 2h. Le système sera indisponible pendant cette période. Nous nous excusons pour la gêne occasionnée.",
        timestamp: "1 semaine",
        priority: "high",
        status: "unread",
        isStarred: false,
    },
]

// Sample contacts for autocomplete
const contacts = [
    { name: "Josias", email: "djodev001@gmail.com", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Promesses Mus", email: "promessesmus@gsolutech.org", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Greg B", email: "gregmalos@gmail.com", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Yves Kab", email: "yveskab@icloud.com", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "huitieme HK", email: "hk243@gmail.com", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Équipe Technique", email: "tech@kivuevent.app", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Support Client", email: "support@kivuevent.app", avatar: "/placeholder.svg?height=32&width=32" },
]

// Current user info
const currentUser = {
    name: "Anelka MD",
    email: "Anelkamd@kivuevent.app",
    avatar: "/profil.JPG",
}

export default function InboxPage() {
    const [filter, setFilter] = useState<string>("all")
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [visibleMessages, setVisibleMessages] = useState<Message[]>(messages)
    const [showSearch, setShowSearch] = useState(false)
    const [composeOpen, setComposeOpen] = useState(false)
    const [replyOpen, setReplyOpen] = useState(false)
    const [showContactSuggestions, setShowContactSuggestions] = useState(false)
    const [filteredContacts, setFilteredContacts] = useState(contacts)
    const [isSending, setIsSending] = useState(false)
    const [newMessage, setNewMessage] = useState({
        to: "",
        subject: "",
        content: "",
    })
    const [replyMessage, setReplyMessage] = useState({
        to: "",
        subject: "",
        content: "",
    })

    const toInputRef = useRef<HTMLInputElement>(null)

    // Filter messages based on filter and search query
    const filterMessages = (filterType: string, query: string) => {
        let filtered = [...messages]

        // Filter by type
        if (filterType === "unread") {
            filtered = filtered.filter((msg) => msg.status === "unread")
        } else if (filterType === "starred") {
            filtered = filtered.filter((msg) => msg.isStarred)
        } else if (filterType === "archived") {
            filtered = filtered.filter((msg) => msg.status === "archived")
        }

        // Filter by search query
        if (query) {
            const lowercaseQuery = query.toLowerCase()
            filtered = filtered.filter(
                (msg) =>
                    msg.subject.toLowerCase().includes(lowercaseQuery) ||
                    msg.sender.name.toLowerCase().includes(lowercaseQuery) ||
                    msg.content.toLowerCase().includes(lowercaseQuery),
            )
        }

        setVisibleMessages(filtered)
    }

    // Handle filter change
    const handleFilterChange = (filterType: string) => {
        setFilter(filterType)
        filterMessages(filterType, searchQuery)
    }

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query)
        filterMessages(filter, query)
    }

    // Mark message as read
    const markAsRead = (id: string) => {
        const updatedMessages = messages.map((msg) => (msg.id === id ? { ...msg, status: "read" as MessageStatus } : msg))
        messages.splice(0, messages.length, ...updatedMessages)
        filterMessages(filter, searchQuery)
    }

    // Toggle star
    const toggleStar = (id: string, event: React.MouseEvent) => {
        event.stopPropagation()
        const updatedMessages = messages.map((msg) => (msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg))
        messages.splice(0, messages.length, ...updatedMessages)
        filterMessages(filter, searchQuery)
    }

    // Archive message
    const archiveMessage = (id: string, event: React.MouseEvent) => {
        event.stopPropagation()
        const updatedMessages = messages.map((msg) =>
            msg.id === id ? { ...msg, status: "archived" as MessageStatus } : msg,
        )
        messages.splice(0, messages.length, ...updatedMessages)
        filterMessages(filter, searchQuery)
    }

    // Delete message animation and logic
    const deleteMessage = (id: string, event: React.MouseEvent) => {
        event.stopPropagation()
        const index = messages.findIndex((msg) => msg.id === id)
        if (index !== -1) {
            setTimeout(() => {
                messages.splice(index, 1)
                filterMessages(filter, searchQuery)
            }, 300) // Wait for animation to complete
        }
    }

    // Get priority indicator
    const getPriorityIndicator = (priority: MessagePriority) => {
        switch (priority) {
            case "high":
                return <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            case "medium":
                return <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            case "low":
                return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            default:
                return null
        }
    }

    // Format the message content with paragraphs
    const formatContent = (content: string) => {
        return content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
                {paragraph}
            </p>
        ))
    }

    // Handle recipient input change with autocomplete
    const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNewMessage({ ...newMessage, to: value })

        if (value.length > 0) {
            const filtered = contacts.filter(
                (contact) =>
                    contact.name.toLowerCase().includes(value.toLowerCase()) ||
                    contact.email.toLowerCase().includes(value.toLowerCase()),
            )
            setFilteredContacts(filtered)
            setShowContactSuggestions(true)
        } else {
            setShowContactSuggestions(false)
        }
    }

    // Select a contact from suggestions
    const selectContact = (contact: (typeof contacts)[0]) => {
        setNewMessage({ ...newMessage, to: contact.email })
        setShowContactSuggestions(false)
    }

    // Send a new message
    const sendMessage = () => {
        if (!newMessage.to || !newMessage.subject || !newMessage.content) {
            toast({
                title: "Champs manquants",
                description: "Veuillez remplir tous les champs avant d'envoyer le message.",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)

        // Simulate sending delay
        setTimeout(() => {
            // Create a new message and add it to the messages array
            const newMsg: Message = {
                id: `new-${Date.now()}`,
                sender: currentUser,
                subject: newMessage.subject,
                preview: newMessage.content.substring(0, 100) + "...",
                content: newMessage.content,
                timestamp: "À l'instant",
                priority: "medium",
                status: "read",
                isStarred: false,
            }

            messages.unshift(newMsg)
            filterMessages(filter, searchQuery)

            // Reset form and close compose dialog
            setNewMessage({ to: "", subject: "", content: "" })
            setComposeOpen(false)
            setIsSending(false)

            toast({
                title: "Message envoyé",
                description: "Votre message a été envoyé avec succès.",
            })
        }, 1500)
    }

    // Send a reply
    const sendReply = () => {
        if (!selectedMessage || !replyMessage.content) {
            toast({
                title: "Message vide",
                description: "Veuillez écrire un message avant d'envoyer.",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)

        // Simulate sending delay
        setTimeout(() => {
            // Create a new message and add it to the messages array
            const newMsg: Message = {
                id: `reply-${Date.now()}`,
                sender: currentUser,
                subject: `Re: ${selectedMessage.subject}`,
                preview: replyMessage.content.substring(0, 100) + "...",
                content: replyMessage.content,
                timestamp: "À l'instant",
                priority: "medium",
                status: "read",
                isStarred: false,
            }

            messages.unshift(newMsg)
            filterMessages(filter, searchQuery)

            // Reset form and close reply dialog
            setReplyMessage({ to: "", subject: "", content: "" })
            setReplyOpen(false)
            setIsSending(false)

            toast({
                title: "Réponse envoyée",
                description: "Votre réponse a été envoyée avec succès.",
            })
        }, 1500)
    }

    // Open reply dialog
    const openReply = () => {
        if (selectedMessage) {
            setReplyMessage({
                to: selectedMessage.sender.email,
                subject: `Re: ${selectedMessage.subject}`,
                content: "",
            })
            setReplyOpen(true)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-medium">Messages</h1>
                    <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-normal">
                        {messages.filter((m) => m.status === "unread").length} non lus
                    </Badge>
                </div>

                <div className="flex items-center space-x-2">
                    {showSearch ? (
                        <div className="relative">
                            <Input
                                placeholder="Rechercher..."
                                className="w-64 pr-8"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => {
                                    setShowSearch(false)
                                    setSearchQuery("")
                                    filterMessages(filter, "")
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
                    )}

                    <Button onClick={() => setComposeOpen(true)} className="rounded-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Nouveau message
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFilterChange("all")}>Tous les messages</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange("unread")}>Non lus</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange("starred")}>Favoris</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange("archived")}>Archivés</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filter chips */}
            <div className="px-6 pb-4 flex items-center space-x-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleFilterChange("all")}
                >
                    <Inbox className="h-4 w-4 mr-2" />
                    Tous
                </Button>
                <Button
                    variant={filter === "unread" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleFilterChange("unread")}
                >
                    <Mail className="h-4 w-4 mr-2" />
                    Non lus
                </Button>
                <Button
                    variant={filter === "starred" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleFilterChange("starred")}
                >
                    <Star className="h-4 w-4 mr-2" />
                    Favoris
                </Button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Messages list */}
                <div className={cn("w-full md:w-2/5 overflow-y-auto px-6 pb-6", selectedMessage ? "hidden md:block" : "block")}>
                    <AnimatePresence>
                        {visibleMessages.length > 0 ? (
                            visibleMessages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "mb-3 p-4 rounded-xl cursor-pointer transition-all",
                                        message.status === "unread" ? "bg-primary/5" : "bg-card hover:bg-muted/50",
                                        selectedMessage?.id === message.id ? "ring-2 ring-primary/20" : "hover:shadow-sm",
                                    )}
                                    onClick={() => {
                                        setSelectedMessage(message)
                                        markAsRead(message.id)
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Avatar className="h-8 w-8 mr-3">
                                                <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                                                <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{message.sender.name}</div>
                                                <div className="text-xs text-muted-foreground">{message.timestamp}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {getPriorityIndicator(message.priority)}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                                onClick={(e) => toggleStar(message.id, e)}
                                            >
                                                <Star className={cn("h-4 w-4", message.isStarred ? "fill-amber-400 text-amber-400" : "")} />
                                            </Button>
                                        </div>
                                    </div>

                                    <h3
                                        className={cn(
                                            "text-sm mb-1 line-clamp-1",
                                            message.status === "unread" ? "font-medium" : "font-normal",
                                        )}
                                    >
                                        {message.subject}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{message.preview}</p>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-64 p-4 text-center"
                            >
                                <div className="bg-muted/50 p-4 rounded-full mb-4">
                                    <Mail className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium mb-1">Aucun message</h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? "Aucun message ne correspond à votre recherche" : "Votre boîte de réception est vide"}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Message detail */}
                <AnimatePresence>
                    {selectedMessage ? (
                        <motion.div
                            className="flex-1 bg-background md:border-l overflow-y-auto"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="sticky top-0 bg-background z-10 p-6 border-b">
                                <div className="flex items-center justify-between mb-4">
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedMessage(null)}>
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon" onClick={(e) => toggleStar(selectedMessage.id, e)}>
                                            <Star
                                                className={cn("h-4 w-4", selectedMessage.isStarred ? "fill-amber-400 text-amber-400" : "")}
                                            />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => archiveMessage(selectedMessage.id, e)}>
                                            <Archive className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => deleteMessage(selectedMessage.id, e)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h2 className="text-xl font-medium mb-4">{selectedMessage.subject}</h2>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Avatar className="h-10 w-10 mr-4">
                                            <AvatarImage
                                                src={selectedMessage.sender.avatar || "/placeholder.svg"}
                                                alt={selectedMessage.sender.name}
                                            />
                                            <AvatarFallback>{selectedMessage.sender.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{selectedMessage.sender.name}</div>
                                            <div className="text-sm text-muted-foreground flex items-center">
                                                <span className="mr-2">{selectedMessage.sender.email}</span>
                                                <span className="text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                                                    {selectedMessage.timestamp}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={openReply}>Répondre</DropdownMenuItem>
                                            <DropdownMenuItem>Transférer</DropdownMenuItem>
                                            <DropdownMenuItem>Marquer comme non lu</DropdownMenuItem>
                                            <DropdownMenuItem>Bloquer l'expéditeur</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="prose prose-sm max-w-none">{formatContent(selectedMessage.content)}</div>

                                <Separator className="my-6" />

                                <div className="flex items-center space-x-2">
                                    <Button onClick={openReply}>Répondre</Button>
                                    <Button variant="outline">Transférer</Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/5">
                            <div className="text-center max-w-md p-8">
                                <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                                    <Mail className="h-10 w-10 text-primary/80" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">Bienvenue dans votre boîte de réception</h3>
                                <p className="text-muted-foreground mb-6">
                                    Sélectionnez un message dans la liste pour l'afficher ici. Vous pouvez également filtrer vos messages
                                    ou effectuer une recherche.
                                </p>
                                <Button onClick={() => setComposeOpen(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Nouveau message
                                </Button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Compose Message Dialog */}
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Nouveau message</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="flex items-center border-b pb-2">
                                    <label htmlFor="to" className="w-16 text-sm font-medium">
                                        À:
                                    </label>
                                    <Input
                                        id="to"
                                        ref={toInputRef}
                                        value={newMessage.to}
                                        onChange={handleRecipientChange}
                                        className="flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
                                        placeholder="Entrez un destinataire"
                                    />
                                </div>
                                {showContactSuggestions && (
                                    <div className="absolute z-10 mt-1 w-full bg-popover rounded-md shadow-md border">
                                        {filteredContacts.length > 0 ? (
                                            <ul className="py-2 max-h-60 overflow-auto">
                                                {filteredContacts.map((contact) => (
                                                    <li
                                                        key={contact.email}
                                                        className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center"
                                                        onClick={() => selectContact(contact)}
                                                    >
                                                        <Avatar className="h-6 w-6 mr-2">
                                                            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-sm">{contact.name}</div>
                                                            <div className="text-xs text-muted-foreground">{contact.email}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">Aucun contact trouvé</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center border-b pb-2">
                                <label htmlFor="subject" className="w-16 text-sm font-medium">
                                    Objet:
                                </label>
                                <Input
                                    id="subject"
                                    value={newMessage.subject}
                                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                                    className="flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
                                    placeholder="Sujet du message"
                                />
                            </div>

                            <Textarea
                                value={newMessage.content}
                                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                placeholder="Écrivez votre message ici..."
                                className="min-h-[200px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                            />

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center">
                                    <Button variant="outline" size="sm" className="mr-2">
                                        <Paperclip className="h-4 w-4 mr-1" /> Joindre
                                    </Button>
                                </div>
                                <Button onClick={sendMessage} disabled={isSending}>
                                    {isSending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" /> Envoyer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reply Dialog */}
            <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Répondre</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center border-b pb-2">
                                <label className="w-16 text-sm font-medium">À:</label>
                                <div className="flex-1 text-sm">{replyMessage.to}</div>
                            </div>

                            <div className="flex items-center border-b pb-2">
                                <label className="w-16 text-sm font-medium">Objet:</label>
                                <div className="flex-1 text-sm">{replyMessage.subject}</div>
                            </div>

                            <Textarea
                                value={replyMessage.content}
                                onChange={(e) => setReplyMessage({ ...replyMessage, content: e.target.value })}
                                placeholder="Écrivez votre réponse ici..."
                                className="min-h-[200px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                                autoFocus
                            />

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center">
                                    <Button variant="outline" size="sm" className="mr-2">
                                        <Paperclip className="h-4 w-4 mr-1" /> Joindre
                                    </Button>
                                </div>
                                <Button onClick={sendReply} disabled={isSending}>
                                    {isSending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" /> Envoyer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}