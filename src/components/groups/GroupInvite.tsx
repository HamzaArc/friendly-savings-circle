
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Copy, 
  Check, 
  MessageSquare,
  Users,
  Clipboard
} from "lucide-react";

interface GroupInviteProps {
  groupId: string;
  groupName: string;
}

const GroupInvite = ({ groupId, groupName }: GroupInviteProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [phoneList, setPhoneList] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inviteLink = `${window.location.origin}/join/${groupId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    
    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard"
    });
    
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };
  
  const addEmail = () => {
    if (!email) return;
    
    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (emailList.includes(email)) {
      toast({
        title: "Duplicate email",
        description: "This email is already in the list",
        variant: "destructive"
      });
      return;
    }
    
    setEmailList([...emailList, email]);
    setEmail("");
  };
  
  const addPhone = () => {
    if (!phone) return;
    
    // Basic phone validation - at least 10 digits
    if (!/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (phoneList.includes(phone)) {
      toast({
        title: "Duplicate number",
        description: "This phone number is already in the list",
        variant: "destructive"
      });
      return;
    }
    
    setPhoneList([...phoneList, phone]);
    setPhone("");
  };
  
  const removeEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter(e => e !== emailToRemove));
  };
  
  const removePhone = (phoneToRemove: string) => {
    setPhoneList(phoneList.filter(p => p !== phoneToRemove));
  };
  
  const sendInvites = () => {
    setIsLoading(true);
    
    // In a real app, this would send actual emails/SMS
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Invitations sent",
        description: `Invitations sent to ${emailList.length} email(s) and ${phoneList.length} phone number(s)`,
      });
      
      // Clear the lists after sending
      setEmailList([]);
      setPhoneList([]);
    }, 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users size={16} />
          Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite to {groupName}</DialogTitle>
          <DialogDescription>
            Send invitations to join your savings group
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link">Invite Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center">
              <Input value={inviteLink} readOnly className="flex-1 mr-2" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {linkCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with people you want to invite to your group. Anyone with this link can request to join.
            </p>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="member@example.com"
                  type="email"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                />
                <Button variant="outline" onClick={addEmail}>Add</Button>
              </div>
            </div>
            
            {emailList.length > 0 && (
              <div className="border rounded-lg p-3 space-y-2">
                <Label>Recipients</Label>
                <div className="flex flex-wrap gap-2">
                  {emailList.map((email) => (
                    <div key={email} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                      <Mail className="mr-1.5 h-3 w-3" />
                      <span className="mr-1">{email}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full" 
                        onClick={() => removeEmail(email)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="(123) 456-7890"
                  type="tel"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addPhone()}
                />
                <Button variant="outline" onClick={addPhone}>Add</Button>
              </div>
            </div>
            
            {phoneList.length > 0 && (
              <div className="border rounded-lg p-3 space-y-2">
                <Label>Recipients</Label>
                <div className="flex flex-wrap gap-2">
                  {phoneList.map((phone) => (
                    <div key={phone} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                      <MessageSquare className="mr-1.5 h-3 w-3" />
                      <span className="mr-1">{phone}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full" 
                        onClick={() => removePhone(phone)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          {(emailList.length > 0 || phoneList.length > 0) && (
            <Button onClick={sendInvites} className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invitations"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupInvite;
