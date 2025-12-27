import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { Breadcrumb } from '@workspace/ui/components/breadcrumb';
import { RoleCard } from '../components';
import { useCreateUser } from '../api/users';
import {
    GraduationCap,
    Wifi,
    Headphones,
    Shield,
    Mail,
    Upload,
    Check,
    Pencil,
} from 'lucide-react';

const roles = [
    {
        id: 'learner',
        label: 'Learner',
        icon: <GraduationCap className="h-5 w-5" />,
        description: 'Access to courses and WebRTC classes.',
    },
    {
        id: 'lecturer',
        label: 'Lecturer',
        icon: <Wifi className="h-5 w-5" />,
        description: 'Manage classes and view student progress.',
    },
    {
        id: 'staff',
        label: 'Staff',
        icon: <Headphones className="h-5 w-5" />,
        description: 'Support tickets and general administration.',
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: <Shield className="h-5 w-5" />,
        description: 'Full access to all system settings.',
    },
];

export function AddUserPage() {
    const navigate = useNavigate();
    const createUser = useCreateUser();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'learner',
        aiFeedback: true,
        webRtcAccess: true,
    });

    const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhotoPreview(reader.result as string);
                setHasProfilePhoto(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
            alert('First Name, Last Name, Email and Password are required');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            await createUser.mutateAsync({
                email: formData.email,
                fullName: `${formData.firstName} ${formData.lastName}`,
                password: formData.password,
                phone: formData.phone || undefined,
                role: formData.role,
                status: 'active',
            });
            navigate('/users');
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Users', href: '/users' },
                    { label: 'Add New User' },
                ]}
                className="mb-6"
            />

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Add New User</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Create a new account and assign roles for the Torii Nihongo platform.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo Section */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                                {profilePhotoPreview ? (
                                    <img
                                        src={profilePhotoPreview}
                                        alt="Profile preview"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : hasProfilePhoto ? (
                                    <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                ) : (
                                    <Upload className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                            {hasProfilePhoto && (
                                <button
                                    type="button"
                                    className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white hover:bg-green-600 transition-colors"
                                    onClick={() => {
                                        setHasProfilePhoto(false);
                                        setProfilePhotoPreview(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <Pencil className="h-3 w-3 text-white" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                Supports JPG, PNG or GIF. Max 5MB.
                            </p>
                            <button
                                type="button"
                                className="text-sm text-primary hover:underline mt-1"
                                onClick={handleUploadClick}
                            >
                                Upload Image
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Details Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">
                                First Name
                            </label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="e.g. Kenji"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">
                                Last Name
                            </label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="e.g. Sato"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="kenji@torii.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                            Phone Number <span className="text-muted-foreground">(Optional)</span>
                        </label>
                        <Input
                            id="phone"
                            type="text"
                            placeholder="+81"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                {/* Role Assignment Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Role Assignment</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                isSelected={formData.role === role.id}
                                onSelect={() => setFormData({ ...formData, role: role.id })}
                            />
                        ))}
                    </div>
                </div>

                {/* Feature Permissions Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Feature Permissions</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                                <div className="font-medium text-sm mb-1">
                                    Enable AI Feedback (FastMCP)
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Allow this user to receive automated AI grading and suggestions.
                                </div>
                            </div>
                            <Switch
                                checked={formData.aiFeedback}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, aiFeedback: checked })
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                                <div className="font-medium text-sm mb-1">
                                    WebRTC Class Access
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Allow joining live video sessions.
                                </div>
                            </div>
                            <Switch
                                checked={formData.webRtcAccess}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, webRtcAccess: checked })
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/users')}
                        disabled={createUser.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createUser.isPending}>
                        {createUser.isPending ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

