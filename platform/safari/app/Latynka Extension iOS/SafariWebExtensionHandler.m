#import "SafariWebExtensionHandler.h"
#import <SafariServices/SafariServices.h>


@implementation SafariWebExtensionHandler

- (void)beginRequestWithExtensionContext:(NSExtensionContext *)context
{
    [context completeRequestReturningItems:nil completionHandler:nil];
}

@end
