#import "ExtensionGuideTopicController.h"


@implementation ExtensionGuideTopicController

- (IBAction)handleOpenAdvancedGuide:(id)sender {
    NSArray* locs = NSBundle.mainBundle.preferredLocalizations;
    if ([locs.firstObject isEqual:@"uk"]) {
        [self openURLString:@"https://paiv.github.io/latynka/"];
    }
    else {
        [self openURLString:@"https://paiv.github.io/latynka/en/"];
    }
}

- (IBAction)handleOpenWikiDstu:(id)sender {
    [self openURLString:@"https://uk.wikipedia.org/wiki/%D0%94%D0%A1%D0%A2%D0%A3_9112:2021"];
}

- (IBAction)handleOpenWikiUkLatn:(id)sender {
    NSArray* locs = NSBundle.mainBundle.preferredLocalizations;
    if ([locs.firstObject isEqual:@"uk"]) {
        [self openURLString:@"https://uk.wikipedia.org/wiki/%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0_%D0%BB%D0%B0%D1%82%D0%B8%D0%BD%D0%BA%D0%B0"];
    }
    else {
        [self openURLString:@"https://en.wikipedia.org/wiki/Ukrainian_Latin_alphabet"];
    }
}

- (void)openURLString:(NSString*)urlString {
    NSURL* url = [NSURL URLWithString:urlString];
    if (url && [UIApplication.sharedApplication canOpenURL:url]) {
        [UIApplication.sharedApplication openURL:url options:@{} completionHandler:nil];
    }
}

@end
