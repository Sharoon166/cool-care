<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { toast } from 'svelte-sonner';
  import SaveIcon from '@tabler/icons-svelte/icons/device-floppy';
  import UserIcon from '@tabler/icons-svelte/icons/user';
  import LockIcon from '@tabler/icons-svelte/icons/lock';
  import KeyIcon from '@tabler/icons-svelte/icons/key';
  import PageHeader from '$lib/components/page-header.svelte';
  import At from '@tabler/icons-svelte/icons/at';
  import EyeIcon from '@tabler/icons-svelte/icons/eye';
  import EyeOffIcon from '@tabler/icons-svelte/icons/eye-off';

  let { data, form } = $props();

  let loading = $state(false);
  let activeTab = $state<'profile' | 'security'>('profile');
  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);

  // Profile form data
  let profileData = $state({
    name: '',
    email: '',
    username: ''
  });

  // Initialize profile data when component loads
  $effect(() => {
    if (data.user) {
      profileData.name = data.user.name || '';
      profileData.email = data.user.email || '';
      profileData.username = data.user.username || '';
    }
  });

  // Password form data
  let passwordData = $state({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  function resetPasswordForm() {
    passwordData.currentPassword = '';
    passwordData.newPassword = '';
    passwordData.confirmPassword = '';
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockIcon }
  ] as const;
</script>

<svelte:head>
  <title>Settings - {profileData.name}</title>
</svelte:head>

<div class="mb-10">
  <PageHeader title="Settings" description="Manage your account settings and preferences" />
</div>

<div class="flex gap-6">
  <!-- Vertical Tabs - Simplified Neo-Brutalist -->
  <div class="w-56 shrink-0">
    <div class="sticky top-6 space-y-3">
      {#each tabs as tab (tab.label)}
        {@const Icon = tab.icon}
        <button
          onclick={() => (activeTab = tab.id)}
          class="w-full rounded-xl border-2 border-brutal p-4 text-left font-bold transition-all
            {activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-background hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}"
        >
          <div class="flex items-center gap-3">
            <Icon class="h-5 w-5" />
            <span>{tab.label}</span>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Content Area -->
  <div class="flex-1 max-w-3xl">
    {#if activeTab === 'profile'}
      <!-- Profile Settings -->
      <div class="rounded-[24px] brutal-card bg-card p-8">
        <div class="mb-6 border-b border-border/40 pb-4">
          <h2 class="flex items-center gap-2 text-2xl font-bold">
            <UserIcon class="h-6 w-6" />
            Profile Information
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Update your personal information and account details
          </p>
        </div>

        <form
          method="POST"
          action="?/updateProfile"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === 'success') {
                toast.success('Profile updated successfully');
              } else if (result.type === 'failure') {
                toast.error('Failed to update profile');
              }
              await update();
            };
          }}
          class="space-y-6"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name" class="font-bold">Full Name</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  bind:value={profileData.name}
                  placeholder="Enter your full name"
                  class="pl-10 brutal"
                  required
                />
              </div>
              {#if form?.errors && 'name' in form.errors && form.errors.name}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.name[0]}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="email" class="font-bold">Email Address</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <At class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  bind:value={profileData.email}
                  placeholder="Enter your email"
                  class="pl-10 brutal"
                  required
                />
              </div>
              {#if form?.errors && 'email' in form.errors && form.errors.email}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.email[0]}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="username" class="font-bold">Username</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <At class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  bind:value={profileData.username}
                  placeholder="Enter your username"
                  class="pl-10 brutal"
                />
              </div>
              {#if form?.errors && 'username' in form.errors && form.errors.username}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.username[0]}</p>
              {/if}
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <Button type="submit" disabled={loading} class="brutal">
              {#if loading}
                <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Updating...
              {:else}
                <SaveIcon class="mr-2 h-4 w-4" />
                Update Profile
              {/if}
            </Button>
          </div>
        </form>
      </div>
    {:else if activeTab === 'security'}
      <!-- Security Settings -->
      <div class="rounded-[24px] brutal-card bg-card p-8">
        <div class="mb-6 border-b border-border/40 pb-4">
          <h2 class="flex items-center gap-2 text-2xl font-bold">
            <LockIcon class="h-6 w-6" />
            Change Password
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>

        <form
          method="POST"
          action="?/changePassword"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === 'success') {
                toast.success('Password changed successfully');
                resetPasswordForm();
              } else if (result.type === 'failure') {
                toast.error('Failed to change password');
              }
              await update();
            };
          }}
          class="space-y-6"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="currentPassword" class="font-bold">Current Password</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  bind:value={passwordData.currentPassword}
                  placeholder="Enter your current password"
                  class="pr-10 pl-10 brutal"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground"
                  onclick={() => (showCurrentPassword = !showCurrentPassword)}
                >
                  {#if showCurrentPassword}
                    <EyeOffIcon class="h-5 w-5 text-muted-foreground" />
                  {:else}
                    <EyeIcon class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </button>
              </div>
              {#if form?.errors && 'currentPassword' in form.errors && form.errors.currentPassword}
                <p class="mt-1 text-sm text-red-600 font-semibold">
                  {form.errors.currentPassword[0]}
                </p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="newPassword" class="font-bold">New Password</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  bind:value={passwordData.newPassword}
                  placeholder="Enter your new password"
                  class="pr-10 pl-10 brutal"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground"
                  onclick={() => (showNewPassword = !showNewPassword)}
                >
                  {#if showNewPassword}
                    <EyeOffIcon class="h-5 w-5 text-muted-foreground" />
                  {:else}
                    <EyeIcon class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </button>
              </div>
              {#if form?.errors && 'newPassword' in form.errors && form.errors.newPassword}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.newPassword[0]}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="confirmPassword" class="font-bold">Confirm New Password</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  bind:value={passwordData.confirmPassword}
                  placeholder="Confirm your new password"
                  class="pr-10 pl-10 brutal"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground"
                  onclick={() => (showConfirmPassword = !showConfirmPassword)}
                >
                  {#if showConfirmPassword}
                    <EyeOffIcon class="h-5 w-5 text-muted-foreground" />
                  {:else}
                    <EyeIcon class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </button>
              </div>
              {#if form?.errors && 'confirmPassword' in form.errors && form.errors.confirmPassword}
                <p class="mt-1 text-sm text-red-600 font-semibold">
                  {form.errors.confirmPassword[0]}
                </p>
              {/if}
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <Button type="submit" disabled={loading} class="brutal">
              {#if loading}
                <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Changing...
              {:else}
                <LockIcon class="mr-2 h-4 w-4" />
                Change Password
              {/if}
            </Button>
          </div>
        </form>
      </div>
    {/if}
  </div>
</div>
