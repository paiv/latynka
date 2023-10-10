#import <SafariServices/SFSafariApplication.h>
#import <SafariServices/SFSafariExtensionManager.h>
#import <SafariServices/SFSafariExtensionState.h>
#import "ViewController.h"

static NSString * const appName = @"Latynka";
static NSString * const extensionBundleIdentifier = @"paiv.latynka.Latynka.Extension";


@implementation ViewController

- (IBAction)handleHelpButton:(id)sender {
    NSURL* url = [NSURL URLWithString:@"https://paiv.github.io/latynka/"];
    [NSWorkspace.sharedWorkspace openURL:url];
}

- (void)viewDidLoad {
    [super viewDidLoad];

    self.appNameLabel.stringValue = appName;

    [SFSafariExtensionManager getStateOfSafariExtensionWithIdentifier:extensionBundleIdentifier completionHandler:^(SFSafariExtensionState * _Nullable state, NSError * _Nullable error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (!state) {
                return;
            }

            if (state.isEnabled)
                self.appNameLabel.stringValue = @"Extension is currently on.";
            else
                self.appNameLabel.stringValue = @"Extension is currently off.\nYou can turn it on\nin Safari Extensions preferences.";
        });
    }];
}

- (IBAction)openSafariExtensionPreferences:(id)sender {
    [SFSafariApplication showPreferencesForExtensionWithIdentifier:extensionBundleIdentifier completionHandler:^(NSError * _Nullable error) {
        if (error) {
            return;
        }

        dispatch_async(dispatch_get_main_queue(), ^{
            [NSApplication.sharedApplication terminate:nil];
        });
    }];
}


@end
